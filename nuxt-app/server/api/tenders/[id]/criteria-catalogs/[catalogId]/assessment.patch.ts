import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../../../utils/postgres'

import type {
  UpdateCriteriaCatalogAssessmentRequest,
  UpdateCriteriaCatalogAssessmentResponse
} from '../../../../../../shared/types/tenders'

interface CatalogAssessmentRow {
  id: string | number
  assessment_text: string | null
}

export default defineEventHandler(async (event): Promise<UpdateCriteriaCatalogAssessmentResponse> => {
  const tenderId = event.context.params?.id?.trim()
  const catalogId = event.context.params?.catalogId?.trim()

  if (!tenderId || !catalogId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id und Kriterienkatalog id sind erforderlich.'
    })
  }

  const body = await readBody<Partial<UpdateCriteriaCatalogAssessmentRequest>>(event)
  const assessmentText = body?.assessmentText?.trim() || ''

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<CatalogAssessmentRow>(
      `UPDATE kriterienkataloge
       SET assessment_text = $3
       WHERE id = $2
         AND ausschreibung_id = $1
       RETURNING id, assessment_text`,
      [tenderId, catalogId, assessmentText || null]
    )

    const catalog = result.rows[0]

    if (!catalog) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kriterienkatalog wurde nicht gefunden.'
      })
    }

    return {
      catalog: {
        id: String(catalog.id),
        assessmentText: catalog.assessment_text || ''
      }
    }
  } finally {
    client.release()
  }
})
