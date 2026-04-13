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

describe('PUT /api/vendors/:id/cost-items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('replaces and stores vendor cost items', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 11, ausschreibung_id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 41, ausschreibung_id: 1 }, { id: 42, ausschreibung_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 101, anbieter_id: 11, kostenblock_id: 41, amount: '1200.50' }] })
      .mockResolvedValueOnce({ rows: [{ id: 102, anbieter_id: 11, kostenblock_id: 42, amount: null }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      items: [
        { costBlockId: '41', amount: 1200.5 },
        { costBlockId: '42', amount: null }
      ]
    })

    const { default: handler } = await import('../server/api/vendors/[id]/cost-items.put')
    const response = await handler({
      context: {
        params: {
          id: '11'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, ausschreibung_id FROM anbieter WHERE id = $1 LIMIT 1', ['11'])
    expect(query).toHaveBeenNthCalledWith(3, 'SELECT id, ausschreibung_id FROM kostenbloecke WHERE id = ANY($1::bigint[])', [['41', '42']])
    expect(query).toHaveBeenNthCalledWith(4, 'DELETE FROM anbieter_kostenpositionen WHERE anbieter_id = $1', ['11'])
    expect(query).toHaveBeenNthCalledWith(5,
      `INSERT INTO anbieter_kostenpositionen (anbieter_id, kostenblock_id, amount)
         VALUES ($1, $2, $3)
         RETURNING id, anbieter_id, kostenblock_id, amount`,
      ['11', '41', 1200.5]
    )
    expect(query).toHaveBeenNthCalledWith(6,
      `INSERT INTO anbieter_kostenpositionen (anbieter_id, kostenblock_id, amount)
         VALUES ($1, $2, $3)
         RETURNING id, anbieter_id, kostenblock_id, amount`,
      ['11', '42', null]
    )
    expect(query).toHaveBeenNthCalledWith(7, 'COMMIT')
    expect(response).toEqual({
      items: [
        { id: '101', vendorId: '11', costBlockId: '41', amount: 1200.5 },
        { id: '102', vendorId: '11', costBlockId: '42', amount: null }
      ]
    })
    expect(release).toHaveBeenCalledTimes(1)
  })
})

