import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'

import type { TenderListItem } from '../../../shared/types/tenders'

interface TenderNavigationRow {
  id: string | number
  name: string
}

export default defineEventHandler(async (event): Promise<TenderListItem[]> => {
  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<TenderNavigationRow>(
      'SELECT id, name FROM ausschreibungen WHERE deleted_at IS NULL ORDER BY created_at DESC, id DESC'
    )

    return result.rows.map(row => ({
      id: String(row.id),
      name: row.name
    }))
  } finally {
    client.release()
  }
})
