import { createError, defineEventHandler, getQuery, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { loadTender } from '../../../utils/tender-settings'

interface CreateSectionBody {
  name: string
  weight: number
  evaluators: string
  description: string
}

interface CreatedSectionRow {
  id: string | number
  name: string
  weight: number
  evaluators: string | null
  description: string | null
}

function normalizeBody(body: Partial<CreateSectionBody> | null | undefined): CreateSectionBody {
  return {
    name: body?.name?.trim() || '',
    weight: body?.weight as number,
    evaluators: body?.evaluators?.trim() || '',
    description: body?.description?.trim() || ''
  }
}

export default defineEventHandler(async (event): Promise<{ id: string, name: string, weight: number, evaluators: string, description: string }> => {
  const tenderId = event.context.params?.id?.trim()
  const catalogIdQuery = getQuery(event).catalogId ? String(getQuery(event).catalogId).trim() : ''

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

    const catalogsResult = await client.query<{ id: string | number }>(
      `SELECT id
       FROM kriterienkataloge
       WHERE ausschreibung_id = $1
       ORDER BY position ASC, id ASC`,
      [tenderId]
    )

    const catalogId = catalogIdQuery && catalogsResult.rows.some((row) => String(row.id) === catalogIdQuery)
      ? catalogIdQuery
      : String(catalogsResult.rows[0]?.id || '')

    if (!catalogId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Es existiert kein Kriterienkatalog für diese Ausschreibung.'
      })
    }

    const result = await client.query<CreatedSectionRow>(
      `INSERT INTO abschnitte (ausschreibung_id, kriterienkatalog_id, name, weight, evaluators, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, weight, evaluators, description`,
      [tenderId, catalogId, body.name, body.weight, body.evaluators || null, body.description || null]
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
      weight: section.weight,
      evaluators: section.evaluators || '',
      description: section.description || ''
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
