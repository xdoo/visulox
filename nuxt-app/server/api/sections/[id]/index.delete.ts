import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { hasSectionQuestions, loadSection } from '../../../utils/tender-settings'

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

    const section = await loadSection(client, sectionId)

    if (!section) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Abschnitt wurde nicht gefunden.'
      })
    }

    if (await hasSectionQuestions(client, sectionId)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Der Abschnitt kann nicht gelöscht werden, weil bereits Fragen importiert wurden.'
      })
    }

    await client.query('DELETE FROM abschnitte WHERE id = $1', [sectionId])
    await client.query('COMMIT')

    return { deleted: true }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
