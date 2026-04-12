import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

export default defineEventHandler(async (event): Promise<{ success: true }> => {
  const costBlockId = event.context.params?.id?.trim()

  if (!costBlockId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kostenblock id is required'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query('DELETE FROM kostenbloecke WHERE id = $1 RETURNING id', [costBlockId])

    if (!result.rows[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kostenblock not found'
      })
    }

    return {
      success: true
    }
  } finally {
    client.release()
  }
})
