import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../../utils/postgres'
import { mapTenderCostBlockRow, parseTenderCostBlockType } from '../../../../utils/tender-cost-blocks'

import type { CreateTenderCostBlockRequest, TenderCostBlock } from '../../../../../shared/types/tenders'

interface TenderRow {
  id: string | number
}

interface CostBlockRow {
  id: string | number
  name: string
  type: string
}

export default defineEventHandler(async (event): Promise<{ costBlock: TenderCostBlock }> => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const body = await readBody<Partial<CreateTenderCostBlockRequest>>(event)
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
    const tenderResult = await client.query<TenderRow>(
      'SELECT id FROM ausschreibungen WHERE id = $1 LIMIT 1',
      [tenderId]
    )

    if (!tenderResult.rows[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ausschreibung not found'
      })
    }

    const result = await client.query<CostBlockRow>(
      'INSERT INTO kostenbloecke (ausschreibung_id, name, type) VALUES ($1, $2, $3) RETURNING id, name, type',
      [tenderId, name, type]
    )

    const row = result.rows[0]

    if (!row) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Kostenblock could not be created'
      })
    }

    return {
      costBlock: mapTenderCostBlockRow(row)
    }
  } finally {
    client.release()
  }
})

