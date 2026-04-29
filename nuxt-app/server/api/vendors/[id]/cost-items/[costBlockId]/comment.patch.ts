import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../../../utils/postgres'

import type { PoolClient } from 'pg'
import type {
  TenderVendorCostItem,
  UpdateVendorCostItemCommentRequest,
  UpdateVendorCostItemCommentResponse
} from '../../../../../../shared/types/tenders'

interface VendorRow {
  id: string | number
  ausschreibung_id: string | number
}

interface CostBlockRow {
  id: string | number
  ausschreibung_id: string | number
}

interface SavedVendorCostItemRow {
  id: string | number
  anbieter_id: string | number
  kostenblock_id: string | number
  amount: string | number | null
  kommentar: string | null
}

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : Number(value)
}

async function loadVendor(client: Pick<PoolClient, 'query'>, vendorId: string) {
  const result = await client.query<VendorRow>(
    'SELECT id, ausschreibung_id FROM anbieter WHERE id = $1 LIMIT 1',
    [vendorId]
  )

  return result.rows[0] || null
}

async function loadCostBlock(client: Pick<PoolClient, 'query'>, costBlockId: string) {
  const result = await client.query<CostBlockRow>(
    'SELECT id, ausschreibung_id FROM kostenbloecke WHERE id = $1 LIMIT 1',
    [costBlockId]
  )

  return result.rows[0] || null
}

export default defineEventHandler(async (event): Promise<UpdateVendorCostItemCommentResponse> => {
  const vendorId = event.context.params?.id?.trim()
  const costBlockId = event.context.params?.costBlockId?.trim()

  if (!vendorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anbieter id is required'
    })
  }

  if (!costBlockId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kostenblock id is required'
    })
  }

  const body = await readBody<Partial<UpdateVendorCostItemCommentRequest>>(event)
  const kommentar = body?.kommentar?.trim() || ''
  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const vendor = await loadVendor(client, vendorId)

    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Anbieter not found'
      })
    }

    const costBlock = await loadCostBlock(client, costBlockId)

    if (!costBlock) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kostenblock not found'
      })
    }

    if (String(vendor.ausschreibung_id) !== String(costBlock.ausschreibung_id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Anbieter and Kostenblock do not belong to the same Ausschreibung'
      })
    }

    const result = await client.query<SavedVendorCostItemRow>(
      `INSERT INTO anbieter_kostenpositionen (anbieter_id, kostenblock_id, amount, kommentar)
       VALUES ($1, $2, NULL, $3)
       ON CONFLICT (anbieter_id, kostenblock_id)
       DO UPDATE SET kommentar = EXCLUDED.kommentar
       RETURNING id, anbieter_id, kostenblock_id, amount, kommentar`,
      [vendorId, costBlockId, kommentar]
    )

    const row = result.rows[0]

    if (!row) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Kostenposition comment could not be saved'
      })
    }

    await client.query('COMMIT')

    const item: TenderVendorCostItem = {
      id: String(row.id),
      vendorId: String(row.anbieter_id),
      costBlockId: String(row.kostenblock_id),
      amount: row.amount === null ? null : toNumber(row.amount),
      kommentar: row.kommentar || ''
    }

    return { item }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
