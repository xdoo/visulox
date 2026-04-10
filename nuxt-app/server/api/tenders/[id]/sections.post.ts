import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { loadTender } from '../../../utils/tender-settings'

interface CreateSectionBody {
  name: string
  weight: number
}

interface CreatedSectionRow {
  id: string | number
  name: string
  weight: number
}

function normalizeBody(body: Partial<CreateSectionBody> | null | undefined): CreateSectionBody {
  return {
    name: body?.name?.trim() || '',
    weight: body?.weight as number
  }
}

export default defineEventHandler(async (event): Promise<{ id: string, name: string, weight: number }> => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const body = normalizeBody(await readBody<Partial<CreateSectionBody>>(event))

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnittsname ist erforderlich.'
    })
  }

  if (!Number.isInteger(body.weight)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnittsgewicht muss eine ganze Zahl sein.'
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

    const result = await client.query<CreatedSectionRow>(
      'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3) RETURNING id, name, weight',
      [tenderId, body.name, body.weight]
    )

    const section = result.rows[0]

    if (!section) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Abschnitt konnte nicht erstellt werden.'
      })
    }

    await client.query('COMMIT')

    return {
      id: String(section.id),
      name: section.name,
      weight: section.weight
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
