import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { hasSectionQuestions, loadSection } from '../../../utils/tender-settings'

interface UpdateSectionBody {
  name: string
  weight: number
}

interface UpdatedSectionRow {
  id: string | number
  name: string
  weight: number
}

function normalizeBody(body: Partial<UpdateSectionBody> | null | undefined): UpdateSectionBody {
  return {
    name: body?.name?.trim() || '',
    weight: body?.weight as number
  }
}

export default defineEventHandler(async (event): Promise<{ id: string, name: string, weight: number }> => {
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
      'UPDATE abschnitte SET name = $1, weight = $2 WHERE id = $3 RETURNING id, name, weight',
      [body.name, body.weight, sectionId]
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
      weight: updatedSection.weight
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
