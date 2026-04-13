import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

import type { PoolClient } from 'pg'
import type {
  SaveVendorCostItemsRequest,
  SaveVendorCostItemsResponse,
  TenderVendorCostItem
} from '../../../shared/types/tenders'

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
}

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : Number(value)
}

function normalizeItem(input: Partial<SaveVendorCostItemsRequest['items'][number]>, index: number) {
  const costBlockId = input.costBlockId?.trim() || ''
  const amount = input.amount

  if (!costBlockId) {
    throw createError({
      statusCode: 400,
      statusMessage: `Item ${index + 1}: costBlockId is required`
    })
  }

  if (amount !== null && (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Item ${index + 1}: amount must be null or a non-negative number`
    })
  }

  return {
    costBlockId,
    amount: amount ?? null
  }
}

async function loadVendor(client: Pick<PoolClient, 'query'>, vendorId: string) {
  const result = await client.query<VendorRow>(
    'SELECT id, ausschreibung_id FROM anbieter WHERE id = $1 LIMIT 1',
    [vendorId]
  )

  return result.rows[0] || null
}

async function loadCostBlocks(client: Pick<PoolClient, 'query'>, costBlockIds: string[]) {
  const result = await client.query<CostBlockRow>(
    'SELECT id, ausschreibung_id FROM kostenbloecke WHERE id = ANY($1::bigint[])',
    [costBlockIds]
  )

  return result.rows
}

export default defineEventHandler(async (event): Promise<SaveVendorCostItemsResponse> => {
  const vendorId = event.context.params?.id?.trim()

  if (!vendorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anbieter id is required'
    })
  }

  const body = await readBody<Partial<SaveVendorCostItemsRequest>>(event)
  const itemsInput = Array.isArray(body?.items) ? body.items : []
  const items = itemsInput.map((item, index) => normalizeItem(item, index))
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

    const costBlockIds = [...new Set(items.map((item) => item.costBlockId))]
    const costBlocks = costBlockIds.length > 0 ? await loadCostBlocks(client, costBlockIds) : []

    if (costBlocks.length !== costBlockIds.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kostenblock not found'
      })
    }

    if (costBlocks.some((costBlock) => String(costBlock.ausschreibung_id) !== String(vendor.ausschreibung_id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Anbieter and Kostenblock do not belong to the same Ausschreibung'
      })
    }

    await client.query('DELETE FROM anbieter_kostenpositionen WHERE anbieter_id = $1', [vendorId])

    const savedItems: TenderVendorCostItem[] = []

    for (const item of items) {
      const result = await client.query<SavedVendorCostItemRow>(
        `INSERT INTO anbieter_kostenpositionen (anbieter_id, kostenblock_id, amount)
         VALUES ($1, $2, $3)
         RETURNING id, anbieter_id, kostenblock_id, amount`,
        [vendorId, item.costBlockId, item.amount]
      )

      const row = result.rows[0]

      if (!row) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Kostenposition could not be saved'
        })
      }

      savedItems.push({
        id: String(row.id),
        vendorId: String(row.anbieter_id),
        costBlockId: String(row.kostenblock_id),
        amount: row.amount === null ? null : toNumber(row.amount)
      })
    }

    await client.query('COMMIT')

    return {
      items: savedItems
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
