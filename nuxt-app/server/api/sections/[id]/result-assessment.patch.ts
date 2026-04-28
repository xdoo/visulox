import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { loadSection } from '../../../utils/tender-settings'

import type {
  UpdateSectionResultAssessmentRequest,
  UpdateSectionResultAssessmentResponse
} from '../../../../shared/types/tenders'

interface UpdatedSectionRow {
  id: string | number
  result_assessment: string | null
}

function normalizeBody(
  body: Partial<UpdateSectionResultAssessmentRequest> | null | undefined
): UpdateSectionResultAssessmentRequest {
  return {
    resultAssessment: body?.resultAssessment?.trim() || ''
  }
}

export default defineEventHandler(async (event): Promise<UpdateSectionResultAssessmentResponse> => {
  const sectionId = event.context.params?.id?.trim()

  if (!sectionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnitt id is required'
    })
  }

  const body = normalizeBody(await readBody<Partial<UpdateSectionResultAssessmentRequest>>(event))
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

    const result = await client.query<UpdatedSectionRow>(
      'UPDATE abschnitte SET result_assessment = $1 WHERE id = $2 RETURNING id, result_assessment',
      [body.resultAssessment || null, sectionId]
    )
    const updatedSection = result.rows[0]

    if (!updatedSection) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Ergebnisbewertung konnte nicht gespeichert werden.'
      })
    }

    await client.query('COMMIT')

    return {
      section: {
        id: String(updatedSection.id),
        resultAssessment: updatedSection.result_assessment || ''
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
