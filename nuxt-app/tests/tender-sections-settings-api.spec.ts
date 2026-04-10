import { beforeEach, describe, expect, it, vi } from 'vitest'

const readBody = vi.fn()
const getPostgresClient = vi.fn()
const useRuntimeConfig = vi.fn()

vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')

  return {
    ...actual,
    readBody,
    createError: ({ statusCode, statusMessage }: { statusCode: number, statusMessage: string }) => {
      const error = new Error(statusMessage) as Error & { statusCode: number, statusMessage: string }
      error.statusCode = statusCode
      error.statusMessage = statusMessage
      return error
    }
  }
})

vi.mock('#imports', () => ({
  useRuntimeConfig
}))

vi.mock('../server/utils/postgres', () => ({
  getPostgresClient
}))

describe('tender section settings api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('creates a new section for a tender', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [{ id: 21, name: 'Service', weight: 40 }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({ name: 'Service', weight: 40 })

    const { default: handler } = await import('../server/api/tenders/[id]/sections.post')
    const response = await handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id FROM ausschreibungen WHERE id = $1 LIMIT 1', ['7'])
    expect(query).toHaveBeenNthCalledWith(3, 'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3) RETURNING id, name, weight', ['7', 'Service', 40])
    expect(query).toHaveBeenNthCalledWith(4, 'COMMIT')
    expect(response).toEqual({ id: '21', name: 'Service', weight: 40 })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('allows section name updates when imported questions already exist and the weight stays unchanged', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 21, ausschreibung_id: 7, name: 'Service', weight: 40 }] })
      .mockResolvedValueOnce({ rows: [{ id: 99 }] })
      .mockResolvedValueOnce({ rows: [{ id: 21, name: 'Neuer Name', weight: 40 }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({ name: 'Neuer Name', weight: 40 })

    const { default: handler } = await import('../server/api/sections/[id]/index.patch')
    const response = await handler({
      context: {
        params: {
          id: '21'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, ausschreibung_id, name, weight FROM abschnitte WHERE id = $1 LIMIT 1', ['21'])
    expect(query).toHaveBeenNthCalledWith(3, 'SELECT id FROM abschnittsfragen WHERE abschnitt_id = $1 LIMIT 1', ['21'])
    expect(query).toHaveBeenNthCalledWith(4, 'UPDATE abschnitte SET name = $1, weight = $2 WHERE id = $3 RETURNING id, name, weight', ['Neuer Name', 40, '21'])
    expect(query).toHaveBeenNthCalledWith(5, 'COMMIT')
    expect(response).toEqual({ id: '21', name: 'Neuer Name', weight: 40 })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('blocks section weight updates when imported questions already exist', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 21, ausschreibung_id: 7, name: 'Service', weight: 40 }] })
      .mockResolvedValueOnce({ rows: [{ id: 99 }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({ name: 'Neuer Name', weight: 50 })

    const { default: handler } = await import('../server/api/sections/[id]/index.patch')

    await expect(handler({
      context: {
        params: {
          id: '21'
        }
      }
    } as never)).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'Das Gewicht kann nicht geändert werden, weil für diesen Abschnitt bereits Fragen importiert wurden.'
    })

    expect(query).toHaveBeenLastCalledWith('ROLLBACK')
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('deletes an unlocked section', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 21, ausschreibung_id: 7, name: 'Service', weight: 40 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/sections/[id]/index.delete')
    const response = await handler({
      context: {
        params: {
          id: '21'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, ausschreibung_id, name, weight FROM abschnitte WHERE id = $1 LIMIT 1', ['21'])
    expect(query).toHaveBeenNthCalledWith(3, 'SELECT id FROM abschnittsfragen WHERE abschnitt_id = $1 LIMIT 1', ['21'])
    expect(query).toHaveBeenNthCalledWith(4, 'DELETE FROM abschnitte WHERE id = $1', ['21'])
    expect(query).toHaveBeenNthCalledWith(5, 'COMMIT')
    expect(response).toEqual({ deleted: true })
    expect(release).toHaveBeenCalledTimes(1)
  })
})
