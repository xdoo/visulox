import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

import type { UpdateTenderRequest, UpdateTenderResponse } from '../../../../shared/types/tenders'

interface TenderRow {
  id: string | number
  name: string
}

export default defineEventHandler(async (event): Promise<UpdateTenderResponse> => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const body = await readBody<Partial<UpdateTenderRequest>>(event)
  const name = body?.name?.trim() || ''

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Der Name der Ausschreibung ist erforderlich.'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<TenderRow>(
      `UPDATE ausschreibungen
       SET name = $2
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name`,
      [tenderId, name]
    )

    const tender = result.rows[0]

    if (!tender) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ausschreibung wurde nicht gefunden.'
      })
    }

    return {
      tender: {
        id: String(tender.id),
        name: tender.name
      }
    }
  } finally {
    client.release()
  }
})
