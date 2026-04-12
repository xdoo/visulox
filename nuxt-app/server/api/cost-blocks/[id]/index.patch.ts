import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'
import { mapTenderCostBlockRow, parseTenderCostBlockType } from '../../../utils/tender-cost-blocks'

import type { TenderCostBlock, UpdateTenderCostBlockRequest } from '../../../../shared/types/tenders'

interface CostBlockRow {
  id: string | number
  name: string
  type: string
}

export default defineEventHandler(async (event): Promise<{ costBlock: TenderCostBlock }> => {
  const costBlockId = event.context.params?.id?.trim()

  if (!costBlockId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kostenblock id is required'
    })
  }

  const body = await readBody<Partial<UpdateTenderCostBlockRequest>>(event)
  const name = body?.name?.trim() || ''

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
    })
  }

  const type = parseTenderCostBlockType(body?.type)
  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<CostBlockRow>(
      'UPDATE kostenbloecke SET name = $2, type = $3 WHERE id = $1 RETURNING id, name, type',
      [costBlockId, name, type]
    )

    const row = result.rows[0]

    if (!row) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kostenblock not found'
      })
    }

    return {
      costBlock: mapTenderCostBlockRow(row)
    }
  } finally {
    client.release()
  }
})

