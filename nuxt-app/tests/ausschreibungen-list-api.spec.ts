import { beforeEach, describe, expect, it, vi } from 'vitest'

const getPostgresClient = vi.fn()
const useRuntimeConfig = vi.fn()

vi.mock('#imports', () => ({
  useRuntimeConfig
}))

vi.mock('../server/utils/postgres', () => ({
  getPostgresClient
}))

describe('GET /api/ausschreibungen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('returns saved ausschreibungen for the navigation', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        { id: 2, name: 'Neue Ausschreibung' },
        { id: 1, name: 'Alte Ausschreibung' }
      ]
    })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/ausschreibungen/index.get')
    const response = await handler({} as never)

    expect(getPostgresClient).toHaveBeenCalledWith('postgresql://visulox:visulox@localhost:5432/visulox')
    expect(query).toHaveBeenCalledWith('SELECT id, name FROM ausschreibungen ORDER BY created_at DESC, id DESC')
    expect(response).toEqual([
      { id: '2', name: 'Neue Ausschreibung' },
      { id: '1', name: 'Alte Ausschreibung' }
    ])
    expect(release).toHaveBeenCalledTimes(1)
  })
})
