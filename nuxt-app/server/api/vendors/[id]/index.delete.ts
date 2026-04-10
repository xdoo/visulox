import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { hasVendorQuestions, loadVendor } from '../../../utils/tender-settings'

export default defineEventHandler(async (event): Promise<{ deleted: true }> => {
  const vendorId = event.context.params?.id?.trim()

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

    const vendor = await loadVendor(client, vendorId)

    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Anbieter wurde nicht gefunden.'
      })
    }

    if (await hasVendorQuestions(client, vendorId)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Der Anbieter kann nicht gelöscht werden, weil bereits Fragen importiert wurden.'
      })
    }

    await client.query('DELETE FROM anbieter WHERE id = $1', [vendorId])
    await client.query('COMMIT')

    return { deleted: true }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
