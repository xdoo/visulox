import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'

import type { AusschreibungListItem } from '../../../shared/types/ausschreibungen'

interface AusschreibungNavigationRow {
  id: string | number
  name: string
}

export default defineEventHandler(async (event): Promise<AusschreibungListItem[]> => {
  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<AusschreibungNavigationRow>(
      'SELECT id, name FROM ausschreibungen ORDER BY created_at DESC, id DESC'
    )

    return result.rows.map(row => ({
      id: String(row.id),
      name: row.name
    }))
  } finally {
    client.release()
  }
})
