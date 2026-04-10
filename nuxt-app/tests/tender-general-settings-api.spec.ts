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

describe('PATCH /api/tenders/:id/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('stores general tender settings via upsert', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7 }] })
      .mockResolvedValueOnce({
        rows: [{
          score_min: 0,
          score_max: 20,
          chart_palette: ['#0D57A6', '#B47D00']
        }]
      })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      scoreRange: [0, 20],
      chartPalette: ['#0D57A6', '#B47D00']
    })

    const { default: handler } = await import('../server/api/tenders/[id]/settings.patch')
    const response = await handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id FROM ausschreibungen WHERE id = $1 LIMIT 1', ['7'])
    expect(query).toHaveBeenNthCalledWith(3,
      `INSERT INTO ausschreibung_settings (ausschreibung_id, score_min, score_max, chart_palette)
       VALUES ($1, $2, $3, $4::text[])
       ON CONFLICT (ausschreibung_id)
       DO UPDATE SET score_min = EXCLUDED.score_min, score_max = EXCLUDED.score_max, chart_palette = EXCLUDED.chart_palette
       RETURNING score_min, score_max, chart_palette`,
      ['7', 0, 20, ['#0D57A6', '#B47D00']]
    )
    expect(query).toHaveBeenNthCalledWith(4, 'COMMIT')
    expect(response).toEqual({
      settings: {
        scoreRange: [0, 20],
        chartPalette: ['#0D57A6', '#B47D00']
      }
    })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid score ranges', async () => {
    readBody.mockResolvedValue({
      scoreRange: [10, 10],
      chartPalette: ['#0D57A6']
    })

    const { default: handler } = await import('../server/api/tenders/[id]/settings.patch')

    await expect(handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Die Bewertungsskala ist ungültig.'
    })
  })
})
