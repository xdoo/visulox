import { beforeEach, describe, expect, it, vi } from 'vitest'

const createError = vi.fn(({ statusCode, statusMessage }: { statusCode: number, statusMessage: string }) => {
  const error = new Error(statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = statusCode
  error.statusMessage = statusMessage
  return error
})
const getPostgresClient = vi.fn()
const useRuntimeConfig = vi.fn()

vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')

  return {
    ...actual,
    createError
  }
})

vi.mock('#imports', () => ({
  useRuntimeConfig
}))

vi.mock('../server/utils/postgres', () => ({
  getPostgresClient
}))

describe('GET /api/ausschreibungen/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('returns the ausschreibung details with vendors and sections', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({
        rows: [{ id: 2, name: 'Neue Ausschreibung' }]
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 11, name: 'Acme AG' },
          { id: 12, name: 'Beispiel GmbH' }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 21, name: 'Qualitaet', weight: 60 },
          { id: 22, name: 'Preis', weight: 40 }
        ]
      })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/ausschreibungen/[id].get')
    const response = await handler({
      context: {
        params: {
          id: '2'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'SELECT id, name FROM ausschreibungen WHERE id = $1 LIMIT 1', ['2'])
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, name FROM anbieter WHERE ausschreibung_id = $1 ORDER BY id ASC', ['2'])
    expect(query).toHaveBeenNthCalledWith(3, 'SELECT id, name, weight FROM abschnitte WHERE ausschreibung_id = $1 ORDER BY id ASC', ['2'])
    expect(response).toEqual({
      id: '2',
      name: 'Neue Ausschreibung',
      vendors: [
        { id: '11', name: 'Acme AG' },
        { id: '12', name: 'Beispiel GmbH' }
      ],
      sections: [
        { id: '21', name: 'Qualitaet', weight: 60 },
        { id: '22', name: 'Preis', weight: 40 }
      ]
    })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('returns 404 when the ausschreibung does not exist', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: []
    })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/ausschreibungen/[id].get')

    await expect(handler({
      context: {
        params: {
          id: '999'
        }
      }
    } as never)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Ausschreibung not found'
    })

    expect(release).toHaveBeenCalledTimes(1)
  })
})
