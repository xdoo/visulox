import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'

import type { TenderListItem } from '../../../shared/types/tenders'

interface TenderNavigationRow {
  id: string | number
  name: string
  catalog_id: string | number | null
  catalog_name: string | null
}

export default defineEventHandler(async (event): Promise<TenderListItem[]> => {
  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<TenderNavigationRow>(
      `SELECT a.id, a.name, k.id AS catalog_id, k.name AS catalog_name
       FROM ausschreibungen a
       LEFT JOIN kriterienkataloge k
         ON k.ausschreibung_id = a.id
       WHERE a.deleted_at IS NULL
       ORDER BY a.created_at DESC, a.id DESC, k.position ASC, k.id ASC`
    )

    const itemsById = new Map<string, TenderListItem>()

    for (const row of result.rows) {
      const tenderId = String(row.id)
      const existing = itemsById.get(tenderId) || {
        id: tenderId,
        name: row.name,
        criteriaCatalogs: []
      }

      if (row.catalog_id !== null && row.catalog_name) {
        existing.criteriaCatalogs!.push({
          id: String(row.catalog_id),
          name: row.catalog_name
        })
      }

      itemsById.set(tenderId, existing)
    }

    return Array.from(itemsById.values())
  } finally {
    client.release()
  }
})
