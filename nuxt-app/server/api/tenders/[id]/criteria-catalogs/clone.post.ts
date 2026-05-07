import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../../utils/postgres'

import type { CloneCriteriaCatalogRequest, CloneCriteriaCatalogResponse } from '../../../../../shared/types/tenders'

interface CatalogRow {
  id: string | number
  name: string
  position: number
}

interface SectionRow {
  name: string
  weight: number
  evaluators: string | null
  description: string | null
}

export default defineEventHandler(async (event): Promise<CloneCriteriaCatalogResponse> => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const body = await readBody<Partial<CloneCriteriaCatalogRequest>>(event)
  const name = body?.name?.trim() || ''
  const sourceCatalogId = body?.sourceCatalogId?.trim() || ''

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Der Name des Kriterienkatalogs ist erforderlich.'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const catalogsResult = await client.query<CatalogRow>(
      `SELECT id, name, position
       FROM kriterienkataloge
       WHERE ausschreibung_id = $1
       ORDER BY position ASC, id ASC`,
      [tenderId]
    )

    const catalogs = catalogsResult.rows

    if (catalogs.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Es existiert kein Kriterienkatalog für diese Ausschreibung.'
      })
    }

    const sourceCatalog = sourceCatalogId
      ? catalogs.find((catalog) => String(catalog.id) === sourceCatalogId) || null
      : catalogs[0]

    if (!sourceCatalog) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quell-Kriterienkatalog wurde nicht gefunden.'
      })
    }

    const nextPosition = (catalogs.at(-1)?.position || 0) + 1
    const createdCatalogResult = await client.query<{ id: string | number }>(
      `INSERT INTO kriterienkataloge (ausschreibung_id, name, position, catalog_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [tenderId, name, nextPosition, 'draft']
    )

    const newCatalogId = createdCatalogResult.rows[0]?.id
    if (!newCatalogId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Kriterienkatalog konnte nicht erstellt werden.'
      })
    }

    const sourceSectionsResult = await client.query<SectionRow>(
      `SELECT name, weight, evaluators, description
       FROM abschnitte
       WHERE ausschreibung_id = $1
         AND (
           kriterienkatalog_id = $2
           OR (kriterienkatalog_id IS NULL AND $2 = $3)
         )
       ORDER BY id ASC`,
      [tenderId, sourceCatalog.id, String(catalogs[0]?.id || '')]
    )

    for (const section of sourceSectionsResult.rows) {
      await client.query(
        `INSERT INTO abschnitte (ausschreibung_id, kriterienkatalog_id, name, weight, evaluators, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tenderId, newCatalogId, section.name, section.weight, section.evaluators, section.description]
      )
    }

    await client.query('COMMIT')

    return {
      catalog: {
        id: String(newCatalogId),
        name,
        type: 'draft'
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
