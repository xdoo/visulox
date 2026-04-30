import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

import type {
  UpdateVendorCostAssessmentRequest,
  UpdateVendorCostAssessmentResponse
} from '../../../../shared/types/tenders'

interface VendorRow {
  id: string | number
  project_cost_assessment: string | null
  run_cost_assessment: string | null
}

interface UpdatedVendorRow {
  id: string | number
  project_cost_assessment: string | null
  run_cost_assessment: string | null
}

function normalizeBody(
  body: Partial<UpdateVendorCostAssessmentRequest> | null | undefined
): UpdateVendorCostAssessmentRequest {
  const kind = body?.kind === 'run' ? 'run' : 'project'

  return {
    kind,
    assessment: body?.assessment?.trim() || ''
  }
}

export default defineEventHandler(async (event): Promise<UpdateVendorCostAssessmentResponse> => {
  const vendorId = event.context.params?.id?.trim()

  if (!vendorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anbieter id is required'
    })
  }

  const body = normalizeBody(await readBody<Partial<UpdateVendorCostAssessmentRequest>>(event))
  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const vendorResult = await client.query<VendorRow>(
      'SELECT id, project_cost_assessment, run_cost_assessment FROM anbieter WHERE id = $1 LIMIT 1',
      [vendorId]
    )
    const vendor = vendorResult.rows[0]

    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Anbieter wurde nicht gefunden.'
      })
    }

    const column = body.kind === 'project' ? 'project_cost_assessment' : 'run_cost_assessment'
    const result = await client.query<UpdatedVendorRow>(
      `UPDATE anbieter
         SET ${column} = $1
       WHERE id = $2
       RETURNING id, project_cost_assessment, run_cost_assessment`,
      [body.assessment || null, vendorId]
    )
    const updatedVendor = result.rows[0]

    if (!updatedVendor) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Kostenbewertung konnte nicht gespeichert werden.'
      })
    }

    await client.query('COMMIT')

    return {
      vendor: {
        id: String(updatedVendor.id),
        projectCostAssessment: updatedVendor.project_cost_assessment || '',
        runCostAssessment: updatedVendor.run_cost_assessment || ''
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
