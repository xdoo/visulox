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

describe('tender vendor settings api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('creates a new vendor for a tender', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({ rows: [{ id: 11, name: 'Acme AG' }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({ name: 'Acme AG' })

    const { default: handler } = await import('../server/api/tenders/[id]/vendors.post')
    const response = await handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id FROM ausschreibungen WHERE id = $1 LIMIT 1', ['7'])
    expect(query).toHaveBeenNthCalledWith(3, 'INSERT INTO anbieter (ausschreibung_id, name) VALUES ($1, $2) RETURNING id, name', ['7', 'Acme AG'])
    expect(query).toHaveBeenNthCalledWith(4, 'COMMIT')
    expect(response).toEqual({ id: '11', name: 'Acme AG' })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('allows vendor updates when imported questions already exist', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 11, ausschreibung_id: 7, name: 'Acme AG' }] })
      .mockResolvedValueOnce({ rows: [{ id: 11, name: 'Acme Europe' }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({ name: 'Acme Europe' })

    const { default: handler } = await import('../server/api/vendors/[id]/index.patch')
    const response = await handler({
      context: {
        params: {
          id: '11'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, ausschreibung_id, name FROM anbieter WHERE id = $1 LIMIT 1', ['11'])
    expect(query).toHaveBeenNthCalledWith(3, 'UPDATE anbieter SET name = $1 WHERE id = $2 RETURNING id, name', ['Acme Europe', '11'])
    expect(query).toHaveBeenNthCalledWith(4, 'COMMIT')
    expect(response).toEqual({ id: '11', name: 'Acme Europe' })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('blocks vendor deletion when imported questions already exist', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 11, ausschreibung_id: 7, name: 'Acme AG' }] })
      .mockResolvedValueOnce({ rows: [{ id: 99 }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/vendors/[id]/index.delete')

    await expect(handler({
      context: {
        params: {
          id: '11'
        }
      }
    } as never)).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'Der Anbieter kann nicht gelöscht werden, weil bereits Fragen importiert wurden.'
    })

    expect(query).toHaveBeenLastCalledWith('ROLLBACK')
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('deletes an unlocked vendor', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 11, ausschreibung_id: 7, name: 'Acme AG' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/vendors/[id]/index.delete')
    const response = await handler({
      context: {
        params: {
          id: '11'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, ausschreibung_id, name FROM anbieter WHERE id = $1 LIMIT 1', ['11'])
    expect(query).toHaveBeenNthCalledWith(3, 'SELECT id FROM abschnittsfragen WHERE anbieter_id = $1 LIMIT 1', ['11'])
    expect(query).toHaveBeenNthCalledWith(4, 'DELETE FROM anbieter WHERE id = $1', ['11'])
    expect(query).toHaveBeenNthCalledWith(5, 'COMMIT')
    expect(response).toEqual({ deleted: true })
    expect(release).toHaveBeenCalledTimes(1)
  })
})
