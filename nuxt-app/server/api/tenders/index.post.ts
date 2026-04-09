import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'

import type { PoolClient } from 'pg'
import type { CreateTenderRequest, CreateTenderResponse } from '../../../shared/types/tenders'

function normalizeCreateTenderRequest(body: Partial<CreateTenderRequest> | null | undefined): CreateTenderRequest {
  return {
    name: body?.name?.trim() ?? '',
    sections: Array.isArray(body?.sections) ? body.sections : [],
    priceCategories: Array.isArray(body?.priceCategories) ? body.priceCategories : [],
    vendors: Array.isArray(body?.vendors) ? body.vendors : []
  }
}

export async function insertTender(client: Pick<PoolClient, 'query'>, payload: CreateTenderRequest) {
  const insertTenderResult = await client.query<{ id: string | number }>(
    'INSERT INTO ausschreibungen (name, created_at) VALUES ($1, NOW()) RETURNING id',
    [payload.name]
  )

  const tenderId = insertTenderResult.rows[0]?.id

  if (tenderId === undefined || tenderId === null) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ausschreibung could not be created'
    })
  }

  for (const section of payload.sections) {
    await client.query(
      'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3)',
      [tenderId, section.name, section.weight]
    )
  }

  for (const priceCategory of payload.priceCategories) {
    await client.query(
      'INSERT INTO kostenbloecke (ausschreibung_id, name) VALUES ($1, $2)',
      [tenderId, priceCategory.name]
    )
  }

  for (const vendor of payload.vendors) {
    await client.query(
      'INSERT INTO anbieter (ausschreibung_id, name) VALUES ($1, $2)',
      [tenderId, vendor.name]
    )
  }

  return String(tenderId)
}

export default defineEventHandler(async (event): Promise<CreateTenderResponse> => {
  const config = useRuntimeConfig(event)
  const body = await readBody<Partial<CreateTenderRequest>>(event)
  const payload = normalizeCreateTenderRequest(body)

  if (!payload.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
    })
  }

  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const id = await insertTender(client, payload)

    await client.query('COMMIT')

    return { id }
  } catch (error) {
    await client.query('ROLLBACK')
    if (error instanceof Error && error.message === 'runtimeConfig.databaseUrl is not set') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database connection is not configured'
      })
    }

    throw error
  } finally {
    client.release()
  }
})
