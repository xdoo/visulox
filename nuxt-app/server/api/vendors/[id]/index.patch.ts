import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { loadVendor } from '../../../utils/tender-settings'

interface UpdateVendorBody {
  name: string
}

interface UpdatedVendorRow {
  id: string | number
  name: string
}

function normalizeBody(body: Partial<UpdateVendorBody> | null | undefined): UpdateVendorBody {
  return {
    name: body?.name?.trim() || ''
  }
}

export default defineEventHandler(async (event): Promise<{ id: string, name: string }> => {
  const vendorId = event.context.params?.id?.trim()

  if (!vendorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anbieter id is required'
    })
  }

  const body = normalizeBody(await readBody<Partial<UpdateVendorBody>>(event))

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

    const vendor = await loadVendor(client, vendorId)

    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Anbieter wurde nicht gefunden.'
      })
    }

    const result = await client.query<UpdatedVendorRow>(
      'UPDATE anbieter SET name = $1 WHERE id = $2 RETURNING id, name',
      [body.name, vendorId]
    )

    const updatedVendor = result.rows[0]

    if (!updatedVendor) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Anbieter konnte nicht aktualisiert werden.'
      })
    }

    await client.query('COMMIT')

    return {
      id: String(updatedVendor.id),
      name: updatedVendor.name
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
