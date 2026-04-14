import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

import type { PoolClient } from 'pg'
import type { CloneTenderRequest, CloneTenderResponse } from '../../../../shared/types/tenders'

interface TenderSourceRow {
  id: string | number
  name: string
}

interface TenderSettingsRow {
  score_min: string | number
  score_max: string | number
  consideration_years: string | number
}

interface TenderChartPaletteRow {
  position: number
  fill_color: string
  text_color: string
}

interface SectionRow {
  name: string
  weight: number
}

interface CostBlockRow {
  name: string
  type: string
}

interface VendorRow {
  name: string
}

async function cloneTenderStructure(client: Pick<PoolClient, 'query'>, sourceTenderId: string, name: string) {
  const insertTenderResult = await client.query<{ id: string | number }>(
    'INSERT INTO ausschreibungen (name, created_at, deleted_at) VALUES ($1, NOW(), NULL) RETURNING id',
    [name]
  )

  const newTenderId = insertTenderResult.rows[0]?.id

  if (newTenderId === undefined || newTenderId === null) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ausschreibung konnte nicht geklont werden.'
    })
  }

  const settingsResult = await client.query<TenderSettingsRow>(
    `SELECT score_min, score_max, consideration_years
       FROM ausschreibung_settings
       WHERE ausschreibung_id = $1
       LIMIT 1`,
    [sourceTenderId]
  )

  const settings = settingsResult.rows[0]

  if (settings) {
    await client.query(
      `INSERT INTO ausschreibung_settings (ausschreibung_id, score_min, score_max, consideration_years)
       VALUES ($1, $2, $3, $4)`,
      [newTenderId, settings.score_min, settings.score_max, settings.consideration_years]
    )

    const paletteResult = await client.query<TenderChartPaletteRow>(
      `SELECT position, fill_color, text_color
         FROM ausschreibung_chart_palette
         WHERE ausschreibung_id = $1
         ORDER BY position ASC`,
      [sourceTenderId]
    )

    for (const paletteEntry of paletteResult.rows) {
      await client.query(
        `INSERT INTO ausschreibung_chart_palette (ausschreibung_id, position, fill_color, text_color)
         VALUES ($1, $2, $3, $4)`,
        [newTenderId, paletteEntry.position, paletteEntry.fill_color, paletteEntry.text_color]
      )
    }
  }

  const sectionsResult = await client.query<SectionRow>(
    'SELECT name, weight FROM abschnitte WHERE ausschreibung_id = $1 ORDER BY id ASC',
    [sourceTenderId]
  )

  for (const section of sectionsResult.rows) {
    await client.query(
      'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3)',
      [newTenderId, section.name, section.weight]
    )
  }

  const costBlocksResult = await client.query<CostBlockRow>(
    'SELECT name, type FROM kostenbloecke WHERE ausschreibung_id = $1 ORDER BY id ASC',
    [sourceTenderId]
  )

  for (const costBlock of costBlocksResult.rows) {
    await client.query(
      'INSERT INTO kostenbloecke (ausschreibung_id, name, type) VALUES ($1, $2, $3)',
      [newTenderId, costBlock.name, costBlock.type]
    )
  }

  const vendorsResult = await client.query<VendorRow>(
    'SELECT name FROM anbieter WHERE ausschreibung_id = $1 ORDER BY id ASC',
    [sourceTenderId]
  )

  for (const vendor of vendorsResult.rows) {
    await client.query(
      'INSERT INTO anbieter (ausschreibung_id, name) VALUES ($1, $2)',
      [newTenderId, vendor.name]
    )
  }

  return String(newTenderId)
}

export default defineEventHandler(async (event): Promise<CloneTenderResponse> => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const body = await readBody<Partial<CloneTenderRequest>>(event)
  const name = body?.name?.trim() || ''

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Der Name der neuen Ausschreibung ist erforderlich.'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const sourceResult = await client.query<TenderSourceRow>(
      'SELECT id, name FROM ausschreibungen WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [tenderId]
    )

    if (!sourceResult.rows[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ausschreibung wurde nicht gefunden.'
      })
    }

    const newTenderId = await cloneTenderStructure(client, tenderId, name)

    await client.query('COMMIT')

    return {
      tender: {
        id: newTenderId,
        name
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
