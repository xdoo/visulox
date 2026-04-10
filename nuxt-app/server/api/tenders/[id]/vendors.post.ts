import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { loadTender } from '../../../utils/tender-settings'

interface CreateVendorBody {
  name: string
}

interface CreatedVendorRow {
  id: string | number
  name: string
}

function normalizeBody(body: Partial<CreateVendorBody> | null | undefined): CreateVendorBody {
  return {
    name: body?.name?.trim() || ''
  }
}

export default defineEventHandler(async (event): Promise<{ id: string, name: string }> => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const body = normalizeBody(await readBody<Partial<CreateVendorBody>>(event))

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anbietername ist erforderlich.'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const tender = await loadTender(client, tenderId)

    if (!tender) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ausschreibung wurde nicht gefunden.'
      })
    }

    const result = await client.query<CreatedVendorRow>(
      'INSERT INTO anbieter (ausschreibung_id, name) VALUES ($1, $2) RETURNING id, name',
      [tenderId, body.name]
    )

    const vendor = result.rows[0]

    if (!vendor) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Anbieter konnte nicht erstellt werden.'
      })
    }

    await client.query('COMMIT')

    return {
      id: String(vendor.id),
      name: vendor.name
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
