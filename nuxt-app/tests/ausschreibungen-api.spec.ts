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

describe('POST /api/ausschreibungen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('creates a new ausschreibung and all nested records in one transaction', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      name: 'IT-Dienstleistungen 2026',
      sections: [{ name: 'Qualitaet', weight: 70 }, { name: 'Preis', weight: 30 }],
      priceCategories: [{ name: 'Implementierung' }],
      vendors: [{ name: 'Acme AG' }]
    })

    const { default: handler } = await import('../server/api/ausschreibungen/index.post')
    const response = await handler({} as never)

    expect(response).toEqual({ id: '42' })
    expect(getPostgresClient).toHaveBeenCalledWith('postgresql://visulox:visulox@localhost:5432/visulox')
    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'INSERT INTO ausschreibungen (name, created_at) VALUES ($1, NOW()) RETURNING id', ['IT-Dienstleistungen 2026'])
    expect(query).toHaveBeenNthCalledWith(3, 'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3)', [42, 'Qualitaet', 70])
    expect(query).toHaveBeenNthCalledWith(4, 'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3)', [42, 'Preis', 30])
    expect(query).toHaveBeenNthCalledWith(5, 'INSERT INTO kostenbloecke (ausschreibung_id, name) VALUES ($1, $2)', [42, 'Implementierung'])
    expect(query).toHaveBeenNthCalledWith(6, 'INSERT INTO anbieter (ausschreibung_id, name) VALUES ($1, $2)', [42, 'Acme AG'])
    expect(query).toHaveBeenNthCalledWith(7, 'COMMIT')
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('rejects requests with an empty name', async () => {
    readBody.mockResolvedValue({
      name: '   ',
      sections: [],
      priceCategories: [],
      vendors: []
    })

    const { default: handler } = await import('../server/api/ausschreibungen/index.post')

    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Name is required'
    })

    expect(getPostgresClient).not.toHaveBeenCalled()
  })

  it('rolls back the transaction when an insert fails', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })
      .mockRejectedValueOnce(new Error('insert failed'))
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      name: 'IT-Dienstleistungen 2026',
      sections: [{ name: 'Qualitaet', weight: 70 }],
      priceCategories: [],
      vendors: []
    })

    const { default: handler } = await import('../server/api/ausschreibungen/index.post')

    await expect(handler({} as never)).rejects.toThrow('insert failed')
    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'INSERT INTO ausschreibungen (name, created_at) VALUES ($1, NOW()) RETURNING id', ['IT-Dienstleistungen 2026'])
    expect(query).toHaveBeenNthCalledWith(3, 'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3)', [42, 'Qualitaet', 70])
    expect(query).toHaveBeenNthCalledWith(4, 'ROLLBACK')
    expect(release).toHaveBeenCalledTimes(1)
  })
})
