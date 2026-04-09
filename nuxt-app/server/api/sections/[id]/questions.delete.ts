import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

interface SectionRow {
  id: string | number
}

export default defineEventHandler(async (event): Promise<{ deleted: true }> => {
  const sectionId = event.context.params?.id?.trim()

  if (!sectionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnitt id is required'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const sectionResult = await client.query<SectionRow>(
      'SELECT id FROM abschnitte WHERE id = $1 LIMIT 1',
      [sectionId]
    )

    if (!sectionResult.rows[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Abschnitt not found'
      })
    }

    await client.query('DELETE FROM abschnittsfragen WHERE abschnitt_id = $1', [sectionId])

    await client.query('COMMIT')

    return { deleted: true }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
