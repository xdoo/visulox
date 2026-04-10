import { beforeEach, describe, expect, it, vi } from 'vitest'

const getPostgresClient = vi.fn()
const getQuery = vi.fn()
const useRuntimeConfig = vi.fn()

vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')

  return {
    ...actual,
    getQuery,
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

describe('DELETE /api/sections/:id/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getQuery.mockReturnValue({
      vendorId: '11'
    })
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('deletes all saved questions for a section', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7, ausschreibung_id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 11, ausschreibung_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/sections/[id]/questions.delete')
    const response = await handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, ausschreibung_id FROM abschnitte WHERE id = $1 LIMIT 1', ['7'])
    expect(query).toHaveBeenNthCalledWith(3, 'SELECT id, ausschreibung_id FROM anbieter WHERE id = $1 LIMIT 1', ['11'])
    expect(query).toHaveBeenNthCalledWith(4, 'DELETE FROM abschnittsfragen WHERE abschnitt_id = $1 AND anbieter_id = $2', ['7', '11'])
    expect(query).toHaveBeenNthCalledWith(5, 'COMMIT')
    expect(response).toEqual({ deleted: true })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('returns 404 for unknown sections', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/sections/[id]/questions.delete')

    await expect(handler({
      context: {
        params: {
          id: '999'
        }
      }
    } as never)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Abschnitt not found'
    })

    expect(query).toHaveBeenLastCalledWith('ROLLBACK')
    expect(release).toHaveBeenCalledTimes(1)
  })
})
