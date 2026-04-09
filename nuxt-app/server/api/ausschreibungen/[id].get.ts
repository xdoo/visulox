import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'

import type { AusschreibungDetail, AusschreibungVendor } from '../../../shared/types/ausschreibungen'

interface AusschreibungRow {
  id: string | number
  name: string
}

interface AnbieterRow {
  id: string | number
  name: string
}

export default defineEventHandler(async (event): Promise<AusschreibungDetail> => {
  const ausschreibungId = event.context.params?.id?.trim()

  if (!ausschreibungId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const ausschreibungResult = await client.query<AusschreibungRow>(
      'SELECT id, name FROM ausschreibungen WHERE id = $1 LIMIT 1',
      [ausschreibungId]
    )

    const ausschreibung = ausschreibungResult.rows[0]

    if (!ausschreibung) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ausschreibung not found'
      })
    }

    const vendorsResult = await client.query<AnbieterRow>(
      'SELECT id, name FROM anbieter WHERE ausschreibung_id = $1 ORDER BY id ASC',
      [ausschreibungId]
    )

    const vendors: AusschreibungVendor[] = vendorsResult.rows.map(row => ({
      id: String(row.id),
      name: row.name
    }))

    return {
      id: String(ausschreibung.id),
      name: ausschreibung.name,
      vendors
    }
  } finally {
    client.release()
  }
})
