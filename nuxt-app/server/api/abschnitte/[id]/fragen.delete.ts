import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

interface AbschnittRow {
  id: string | number
}

export default defineEventHandler(async (event): Promise<{ deleted: true }> => {
  const abschnittId = event.context.params?.id?.trim()

  if (!abschnittId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnitt id is required'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const abschnittResult = await client.query<AbschnittRow>(
      'SELECT id FROM abschnitte WHERE id = $1 LIMIT 1',
      [abschnittId]
    )

    if (!abschnittResult.rows[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Abschnitt not found'
      })
    }

    await client.query('DELETE FROM abschnittsfragen WHERE abschnitt_id = $1', [abschnittId])

    await client.query('COMMIT')

    return { deleted: true }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
