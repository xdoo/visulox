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

describe('tender general actions APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('renames a tender', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{ id: 7, name: 'Neuer Name' }]
    })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({ name: 'Neuer Name' })

    const { default: handler } = await import('../server/api/tenders/[id]/index.patch')
    const response = await handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)

    expect(query).toHaveBeenCalledWith(
      `UPDATE ausschreibungen
       SET name = $2
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name`,
      ['7', 'Neuer Name']
    )
    expect(response).toEqual({
      tender: {
        id: '7',
        name: 'Neuer Name'
      }
    })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('soft deletes a tender', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{ id: 7, name: 'Zu löschen' }]
    })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/tenders/[id]/index.delete')
    const response = await handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)

    expect(query).toHaveBeenCalledWith(
      `UPDATE ausschreibungen
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name`,
      ['7']
    )
    expect(response).toEqual({
      tender: {
        id: '7',
        name: 'Zu löschen'
      }
    })
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('clones the tender structure without evaluation data', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 7, name: 'Quelle' }] })
      .mockResolvedValueOnce({ rows: [{ id: 11 }] })
      .mockResolvedValueOnce({ rows: [{ score_min: 0, score_max: 10, consideration_years: 12 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ position: 0, fill_color: '#0D57A6', text_color: '#FFFFFF' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ name: 'Qualität', weight: 60 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ name: 'Lizenzen', type: 'license_one_time' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ name: 'Acme AG' }] })
      .mockResolvedValueOnce({ rows: [] })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })
    readBody.mockResolvedValue({ name: 'Kopie von Quelle' })

    const { default: handler } = await import('../server/api/tenders/[id]/clone.post')
    const response = await handler({
      context: {
        params: {
          id: '7'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN')
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT id, name FROM ausschreibungen WHERE id = $1 AND deleted_at IS NULL LIMIT 1', ['7'])
    expect(query).toHaveBeenNthCalledWith(3, 'INSERT INTO ausschreibungen (name, created_at, deleted_at) VALUES ($1, NOW(), NULL) RETURNING id', ['Kopie von Quelle'])
    expect(query).toHaveBeenNthCalledWith(4,
      `SELECT score_min, score_max, consideration_years
       FROM ausschreibung_settings
       WHERE ausschreibung_id = $1
       LIMIT 1`,
      ['7']
    )
    expect(query).toHaveBeenNthCalledWith(5,
      `INSERT INTO ausschreibung_settings (ausschreibung_id, score_min, score_max, consideration_years)
       VALUES ($1, $2, $3, $4)`,
      [11, 0, 10, 12]
    )
    expect(query).toHaveBeenNthCalledWith(6,
      `SELECT position, fill_color, text_color
         FROM ausschreibung_chart_palette
         WHERE ausschreibung_id = $1
         ORDER BY position ASC`,
      ['7']
    )
    expect(query).toHaveBeenNthCalledWith(7,
      `INSERT INTO ausschreibung_chart_palette (ausschreibung_id, position, fill_color, text_color)
         VALUES ($1, $2, $3, $4)`,
      [11, 0, '#0D57A6', '#FFFFFF']
    )
    expect(query).toHaveBeenNthCalledWith(8, 'SELECT name, weight FROM abschnitte WHERE ausschreibung_id = $1 ORDER BY id ASC', ['7'])
    expect(query).toHaveBeenNthCalledWith(9, 'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3)', [11, 'Qualität', 60])
    expect(query).toHaveBeenNthCalledWith(10, 'SELECT name, type FROM kostenbloecke WHERE ausschreibung_id = $1 ORDER BY id ASC', ['7'])
    expect(query).toHaveBeenNthCalledWith(11, 'INSERT INTO kostenbloecke (ausschreibung_id, name, type) VALUES ($1, $2, $3)', [11, 'Lizenzen', 'license_one_time'])
    expect(query).toHaveBeenNthCalledWith(12, 'SELECT name FROM anbieter WHERE ausschreibung_id = $1 ORDER BY id ASC', ['7'])
    expect(query).toHaveBeenNthCalledWith(13, 'INSERT INTO anbieter (ausschreibung_id, name) VALUES ($1, $2)', [11, 'Acme AG'])
    expect(query).toHaveBeenNthCalledWith(14, 'COMMIT')
    expect(response).toEqual({
      tender: {
        id: '11',
        name: 'Kopie von Quelle'
      }
    })
    expect(release).toHaveBeenCalledTimes(1)
  })
})
