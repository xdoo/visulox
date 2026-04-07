import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'

import type { PoolClient } from 'pg'
import type { CreateAusschreibungRequest, CreateAusschreibungResponse } from '../../../shared/types/ausschreibungen'

function normalizeCreateAusschreibungRequest(body: Partial<CreateAusschreibungRequest> | null | undefined): CreateAusschreibungRequest {
  return {
    name: body?.name?.trim() ?? '',
    sections: Array.isArray(body?.sections) ? body.sections : [],
    priceCategories: Array.isArray(body?.priceCategories) ? body.priceCategories : [],
    vendors: Array.isArray(body?.vendors) ? body.vendors : []
  }
}

export async function insertAusschreibung(client: Pick<PoolClient, 'query'>, payload: CreateAusschreibungRequest) {
  const insertAusschreibungResult = await client.query<{ id: string | number }>(
    'INSERT INTO ausschreibungen (name, created_at) VALUES ($1, NOW()) RETURNING id',
    [payload.name]
  )

  const ausschreibungId = insertAusschreibungResult.rows[0]?.id

  if (ausschreibungId === undefined || ausschreibungId === null) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ausschreibung could not be created'
    })
  }

  for (const section of payload.sections) {
    await client.query(
      'INSERT INTO abschnitte (ausschreibung_id, name, weight) VALUES ($1, $2, $3)',
      [ausschreibungId, section.name, section.weight]
    )
  }

  for (const priceCategory of payload.priceCategories) {
    await client.query(
      'INSERT INTO kostenbloecke (ausschreibung_id, name) VALUES ($1, $2)',
      [ausschreibungId, priceCategory.name]
    )
  }

  for (const vendor of payload.vendors) {
    await client.query(
      'INSERT INTO anbieter (ausschreibung_id, name) VALUES ($1, $2)',
      [ausschreibungId, vendor.name]
    )
  }

  return String(ausschreibungId)
}

export default defineEventHandler(async (event): Promise<CreateAusschreibungResponse> => {
  const config = useRuntimeConfig(event)
  const body = await readBody<Partial<CreateAusschreibungRequest>>(event)
  const payload = normalizeCreateAusschreibungRequest(body)

  if (!payload.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name is required'
    })
  }

  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const id = await insertAusschreibung(client, payload)

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
