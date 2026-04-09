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

describe('POST /api/sections/:id/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('replaces and stores the uploaded questions with weighted points', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7, weight: 50 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 101, nr: '1', frage: 'Frage A', punkte: '10', anteil: '0.3', gewichtete_punkte: '3.0' }] })
      .mockResolvedValueOnce({ rows: [{ id: 102, nr: '2', frage: 'Frage B', punkte: '20', anteil: '0.2', gewichtete_punkte: '4.0' }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      questions: [
        { nr: '1', frage: 'Frage A', punkte: 10, anteil: 0.3 },
        { nr: '2', frage: 'Frage B', punkte: 20, anteil: 0.2 }
      ]
    })

    const { default: handler } = await import('../server/api/sections/[id]/questions.post')
    const response = await handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, weight FROM abschnitte WHERE id = $1 LIMIT 1', ['7'])
    expect(query).toHaveBeenNthCalledWith(3, 'DELETE FROM abschnittsfragen WHERE abschnitt_id = $1', ['7'])
    expect(query).toHaveBeenNthCalledWith(4,
      `INSERT INTO abschnittsfragen (abschnitt_id, nr, frage, punkte, anteil, gewichtete_punkte)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nr, frage, punkte, anteil, gewichtete_punkte`,
      ['7', '1', 'Frage A', 10, 0.3, 3]
    )
    expect(query).toHaveBeenNthCalledWith(5,
      `INSERT INTO abschnittsfragen (abschnitt_id, nr, frage, punkte, anteil, gewichtete_punkte)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nr, frage, punkte, anteil, gewichtete_punkte`,
      ['7', '2', 'Frage B', 20, 0.2, 4]
    )
    expect(query).toHaveBeenNthCalledWith(6, 'COMMIT')
    expect(response).toEqual({
      questions: [
        { id: '101', nr: '1', frage: 'Frage A', punkte: 10, anteil: 0.3, gewichtetePunkte: 3 },
        { id: '102', nr: '2', frage: 'Frage B', punkte: 20, anteil: 0.2, gewichtetePunkte: 4 }
      ]
    })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('rejects uploads when the anteil sum does not match the abschnitt weight', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7, weight: 60 }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({
      questions: [
        { nr: '1', frage: 'Frage A', punkte: 10, anteil: 0.3 },
        { nr: '2', frage: 'Frage B', punkte: 20, anteil: 0.2 }
      ]
    })

    const { default: handler } = await import('../server/api/sections/[id]/questions.post')

    await expect(handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Question anteil sum 50% does not match abschnitt weight 60%'
    })

    expect(query).toHaveBeenLastCalledWith('ROLLBACK')
    expect(release).toHaveBeenCalledTimes(1)
  })
})
