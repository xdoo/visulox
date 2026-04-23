import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { hasSectionQuestions, loadSection } from '../../../utils/tender-settings'

interface UpdateSectionBody {
  name: string
  weight: number
  evaluators: string
  description: string
}

interface UpdatedSectionRow {
  id: string | number
  name: string
  weight: number
  evaluators: string | null
  description: string | null
}

function normalizeBody(body: Partial<UpdateSectionBody> | null | undefined): UpdateSectionBody {
  return {
    name: body?.name?.trim() || '',
    weight: body?.weight as number,
    evaluators: body?.evaluators?.trim() || '',
    description: body?.description?.trim() || ''
  }
}

export default defineEventHandler(async (event): Promise<{ id: string, name: string, weight: number, evaluators: string, description: string }> => {
  const sectionId = event.context.params?.id?.trim()

  if (!sectionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnitt id is required'
    })
  }

  const body = normalizeBody(await readBody<Partial<UpdateSectionBody>>(event))

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

    const section = await loadSection(client, sectionId)

    if (!section) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Abschnitt wurde nicht gefunden.'
      })
    }

    const sectionHasQuestions = await hasSectionQuestions(client, sectionId)

    if (sectionHasQuestions && body.weight !== section.weight) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Das Gewicht kann nicht geändert werden, weil für diesen Abschnitt bereits Fragen importiert wurden.'
      })
    }

    const result = await client.query<UpdatedSectionRow>(
      'UPDATE abschnitte SET name = $1, weight = $2, evaluators = $3, description = $4 WHERE id = $5 RETURNING id, name, weight, evaluators, description',
      [body.name, body.weight, body.evaluators || null, body.description || null, sectionId]
    )

    const updatedSection = result.rows[0]

    if (!updatedSection) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Abschnitt konnte nicht aktualisiert werden.'
      })
    }

    await client.query('COMMIT')

    return {
      id: String(updatedSection.id),
      name: updatedSection.name,
      weight: updatedSection.weight,
      evaluators: updatedSection.evaluators || '',
      description: updatedSection.description || ''
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
