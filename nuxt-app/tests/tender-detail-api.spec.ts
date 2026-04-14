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

describe('GET /api/tenders/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRuntimeConfig.mockReturnValue({
      databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
    })
  })

  it('returns the ausschreibung details with vendors, sections and saved questions', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({
        rows: [{ id: 2, name: 'Neue Ausschreibung' }]
      })
      .mockResolvedValueOnce({
        rows: [{
          score_min: 0,
          score_max: 15,
          consideration_years: 10
        }]
      })
      .mockResolvedValueOnce({
        rows: [
          { fill_color: '#0D57A6', text_color: '#FFFFFF' },
          { fill_color: '#B47D00', text_color: '#111111' }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 11, name: 'Acme AG' },
          { id: 12, name: 'Beispiel GmbH' }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 41, name: 'Lizenzen', type: 'license_one_time' }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 51, anbieter_id: 11, kostenblock_id: 41, amount: '1200.50' }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 21, name: 'Qualitaet', weight: 60 },
          { id: 22, name: 'Preis', weight: 40 }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { id: 31, abschnitt_id: 21, anbieter_id: 11, nr: '1', frage: 'Service', punkte: '10', anteil: '0.6', gewichtete_punkte: '6.0' },
          { id: 32, abschnitt_id: 21, anbieter_id: 12, nr: '1', frage: 'Betrieb', punkte: '8', anteil: '0.6', gewichtete_punkte: '4.8' }
        ]
      })
    const release = vi.fn()

    getPostgresClient.mockResolvedValue({ query, release })

    const { default: handler } = await import('../server/api/tenders/[id].get')
    const response = await handler({
      context: {
        params: {
          id: '2'
        }
      }
    } as never)

    expect(query).toHaveBeenNthCalledWith(1, 'SELECT id, name FROM ausschreibungen WHERE id = $1 AND deleted_at IS NULL LIMIT 1', ['2'])
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT score_min, score_max, consideration_years FROM ausschreibung_settings WHERE ausschreibung_id = $1 LIMIT 1', ['2'])
    expect(query).toHaveBeenNthCalledWith(3,
      `SELECT fill_color, text_color
         FROM ausschreibung_chart_palette
         WHERE ausschreibung_id = $1
         ORDER BY position ASC`,
      ['2']
    )
    expect(query).toHaveBeenNthCalledWith(4, 'SELECT id, name FROM anbieter WHERE ausschreibung_id = $1 ORDER BY id ASC', ['2'])
    expect(query).toHaveBeenNthCalledWith(5, 'SELECT id, name, type FROM kostenbloecke WHERE ausschreibung_id = $1 ORDER BY id ASC', ['2'])
    expect(query).toHaveBeenNthCalledWith(6,
      `SELECT id, anbieter_id, kostenblock_id, amount
         FROM anbieter_kostenpositionen
         WHERE anbieter_id = ANY($1::bigint[])
         ORDER BY id ASC`,
      [['11', '12']]
    )
    expect(query).toHaveBeenNthCalledWith(7, 'SELECT id, name, weight FROM abschnitte WHERE ausschreibung_id = $1 ORDER BY id ASC', ['2'])
    expect(query).toHaveBeenNthCalledWith(8,
      `SELECT id, abschnitt_id, anbieter_id, nr, frage, punkte, anteil, gewichtete_punkte
         FROM abschnittsfragen
         WHERE abschnitt_id = ANY($1::bigint[])
         ORDER BY id ASC`,
      [['21', '22']]
    )
    expect(response).toEqual({
      id: '2',
      name: 'Neue Ausschreibung',
      settings: {
        scoreRange: [0, 15],
        considerationYears: 10,
        chartPalette: [
          { fillColor: '#0D57A6', textColor: '#FFFFFF' },
          { fillColor: '#B47D00', textColor: '#111111' }
        ]
      },
      vendors: [
        { id: '11', name: 'Acme AG' },
        { id: '12', name: 'Beispiel GmbH' }
      ],
      costBlocks: [
        { id: '41', name: 'Lizenzen', type: 'license_one_time' }
      ],
      vendorCostItems: [
        { id: '51', vendorId: '11', costBlockId: '41', amount: 1200.5 }
      ],
      sections: [
        {
          id: '21',
          name: 'Qualitaet',
          weight: 60,
          questionsByVendor: [
            {
              vendorId: '11',
              questions: [
                { id: '31', nr: '1', frage: 'Service', punkte: 10, anteil: 0.6, gewichtetePunkte: 6 }
              ]
            },
            {
              vendorId: '12',
              questions: [
                { id: '32', nr: '1', frage: 'Betrieb', punkte: 8, anteil: 0.6, gewichtetePunkte: 4.8 }
              ]
            }
          ]
        },
        {
          id: '22',
          name: 'Preis',
          weight: 40,
          questionsByVendor: [
            {
              vendorId: '11',
              questions: []
            },
            {
              vendorId: '12',
              questions: []
            }
          ]
        }
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

    const { default: handler } = await import('../server/api/tenders/[id].get')

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
