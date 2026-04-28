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

describe('PATCH /api/sections/:id/result-assessment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('updates the category result assessment', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{
          id: 21,
          ausschreibung_id: 7,
          name: 'Qualitaet',
          weight: 60
        }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 21, result_assessment: '## Bewertung\n\nAlpha liegt vorne.' }]
      })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      resultAssessment: '  ## Bewertung\n\nAlpha liegt vorne.  '
    })

    const { default: handler } = await import('../server/api/sections/[id]/result-assessment.patch')
    const response = await handler({
      context: {
        params: {
          id: '21'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, ausschreibung_id, name, weight FROM abschnitte WHERE id = $1 LIMIT 1', ['21'])
    expect(query).toHaveBeenNthCalledWith(
      3,
      'UPDATE abschnitte SET result_assessment = $1 WHERE id = $2 RETURNING id, result_assessment',
      ['## Bewertung\n\nAlpha liegt vorne.', '21']
    )
    expect(query).toHaveBeenNthCalledWith(4, 'COMMIT')
    expect(response).toEqual({
      section: {
        id: '21',
        resultAssessment: '## Bewertung\n\nAlpha liegt vorne.'
      }
    })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('stores empty result assessments as null', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{
          id: 21,
          ausschreibung_id: 7,
          name: 'Qualitaet',
          weight: 60
        }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 21, result_assessment: null }]
      })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      resultAssessment: '   '
    })

    const { default: handler } = await import('../server/api/sections/[id]/result-assessment.patch')
    const response = await handler({
      context: {
        params: {
          id: '21'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(
      3,
      'UPDATE abschnitte SET result_assessment = $1 WHERE id = $2 RETURNING id, result_assessment',
      [null, '21']
    )
    expect(response.section.resultAssessment).toBe('')
  })
})
