import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../../utils/postgres'

import type { UpdateCriteriaCatalogRequest, UpdateCriteriaCatalogResponse } from '../../../../../shared/types/tenders'

interface CatalogRow {
  id: string | number
  name: string
  catalog_type: string
  assessment_text: string | null
}

export default defineEventHandler(async (event): Promise<UpdateCriteriaCatalogResponse> => {
  const tenderId = event.context.params?.id?.trim()
  const catalogId = event.context.params?.catalogId?.trim()

  if (!tenderId || !catalogId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id und Kriterienkatalog id sind erforderlich.'
    })
  }

  const body = await readBody<Partial<UpdateCriteriaCatalogRequest>>(event)
  const name = body?.name?.trim() || ''
  const catalogType = body?.type || 'draft'

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Der Name des Kriterienkatalogs ist erforderlich.'
    })
  }

  if (catalogType !== 'main' && catalogType !== 'report' && catalogType !== 'draft') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Der Typ des Kriterienkatalogs ist ungültig.'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const result = await client.query<CatalogRow>(
      `UPDATE kriterienkataloge
       SET name = $3,
           catalog_type = $4
       WHERE id = $2
         AND ausschreibung_id = $1
       RETURNING id, name, catalog_type, assessment_text`,
      [tenderId, catalogId, name, catalogType]
    )

    const catalog = result.rows[0]

    if (!catalog) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kriterienkatalog wurde nicht gefunden.'
      })
    }

    return {
      catalog: {
        id: String(catalog.id),
        name: catalog.name,
        type: catalog.catalog_type === 'main' || catalog.catalog_type === 'report' ? catalog.catalog_type : 'draft',
        assessmentText: catalog.assessment_text || ''
      }
    }
  } finally {
    client.release()
  }
})
