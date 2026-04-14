import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

import type { DeleteTenderResponse } from '../../../../shared/types/tenders'

interface TenderRow {
  id: string | number
  name: string
}

export default defineEventHandler(async (event): Promise<DeleteTenderResponse> => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<TenderRow>(
      `UPDATE ausschreibungen
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name`,
      [tenderId]
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
