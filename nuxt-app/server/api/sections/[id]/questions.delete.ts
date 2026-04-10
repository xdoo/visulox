import { createError, defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

interface SectionRow {
  id: string | number
  ausschreibung_id: string | number
}

interface VendorRow {
  id: string | number
  ausschreibung_id: string | number
}

export default defineEventHandler(async (event): Promise<{ deleted: true }> => {
  const sectionId = event.context.params?.id?.trim()
  const vendorId = getQuery(event).vendorId?.toString().trim() || ''

  if (!sectionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnitt id is required'
    })
  }

  if (!vendorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anbieter id is required'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const sectionResult = await client.query<SectionRow>(
      'SELECT id, ausschreibung_id FROM abschnitte WHERE id = $1 LIMIT 1',
      [sectionId]
    )

    const section = sectionResult.rows[0]

    if (!section) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Abschnitt not found'
      })
    }

    const vendorResult = await client.query<VendorRow>(
      'SELECT id, ausschreibung_id FROM anbieter WHERE id = $1 LIMIT 1',
      [vendorId]
    )

    const vendor = vendorResult.rows[0]

    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Anbieter not found'
      })
    }

    if (String(section.ausschreibung_id) !== String(vendor.ausschreibung_id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Abschnitt and Anbieter do not belong to the same Ausschreibung'
      })
    }

    await client.query('DELETE FROM abschnittsfragen WHERE abschnitt_id = $1 AND anbieter_id = $2', [sectionId, vendorId])

    await client.query('COMMIT')

    return { deleted: true }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
