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

describe('cost block settings api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('creates a typed cost block for a tender', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 31, name: 'Lizenzen', type: 'license_one_time' }] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      name: 'Lizenzen',
      type: 'license_one_time'
    })

    const { default: handler } = await import('../server/api/tenders/[id]/cost-blocks/index.post')
    const response = await handler({
      context: {
        params: {
          id: '1'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'SELECT id FROM ausschreibungen WHERE id = $1 LIMIT 1', ['1'])
    expect(query).toHaveBeenNthCalledWith(2,
      'INSERT INTO kostenbloecke (ausschreibung_id, name, type) VALUES ($1, $2, $3) RETURNING id, name, type',
      ['1', 'Lizenzen', 'license_one_time']
    )
    expect(response).toEqual({
      costBlock: {
        id: '31',
        name: 'Lizenzen',
        type: 'license_one_time'
      }
    })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('updates a cost block', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 31, name: 'Betrieb', type: 'vendor_operating' }] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      name: 'Betrieb',
      type: 'vendor_operating'
    })

    const { default: handler } = await import('../server/api/cost-blocks/[id]/index.patch')
    const response = await handler({
      context: {
        params: {
          id: '31'
        }
      }
    } as never)

    expect(query).toHaveBeenCalledWith(
      'UPDATE kostenbloecke SET name = $2, type = $3 WHERE id = $1 RETURNING id, name, type',
      ['31', 'Betrieb', 'vendor_operating']
    )
    expect(response).toEqual({
      costBlock: {
        id: '31',
        name: 'Betrieb',
        type: 'vendor_operating'
      }
    })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('deletes a cost block', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 31 }] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/cost-blocks/[id]/index.delete')
    const response = await handler({
      context: {
        params: {
          id: '31'
        }
      }
    } as never)

    expect(query).toHaveBeenCalledWith('DELETE FROM kostenbloecke WHERE id = $1 RETURNING id', ['31'])
    expect(response).toEqual({ success: true })
    expect(release).toHaveBeenCalledTimes(1)
  })
})

