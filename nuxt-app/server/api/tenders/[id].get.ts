import { createError, defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'
import { normalizeTenderSettingsRow } from '../../utils/tender-general-settings'
import { mapTenderCostBlockRow } from '../../utils/tender-cost-blocks'

import type {
  SectionQuestion,
  TenderCostBlock,
  TenderCriteriaCatalog,
  TenderDetail,
  TenderSection,
  TenderSectionQuestionsByVendor,
  TenderVendorCostItem,
  TenderVendor
} from '../../../shared/types/tenders'

interface TenderRow {
  id: string | number
  name: string
}

interface TenderSettingsRow {
  score_min: string | number
  score_max: string | number
  consideration_years: string | number
}

interface TenderChartPaletteRow {
  fill_color: string
  text_color: string
}

interface VendorRow {
  id: string | number
  name: string
  project_cost_assessment: string | null
  run_cost_assessment: string | null
}

interface CostBlockRow {
  id: string | number
  name: string
  type: string
}

interface VendorCostItemRow {
  id: string | number
  anbieter_id: string | number
  kostenblock_id: string | number
  amount: string | number | null
  kommentar: string | null
}

interface SectionRow {
  id: string | number
  name: string
  weight: number
  evaluators: string | null
  description: string | null
  result_assessment: string | null
}

interface CriteriaCatalogRow {
  id: string | number
  name: string
  catalog_type: string
  assessment_text: string | null
}

interface SectionQuestionRow {
  id: string | number
  abschnitt_id: string | number
  anbieter_id: string | number
  nr: string
  frage: string
  punkte: string | number
  kommentar: string | null
  anteil: string | number
  gewichtete_punkte: string | number
}

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : Number(value)
}

export default defineEventHandler(async (event): Promise<TenderDetail> => {
  const tenderId = event.context.params?.id?.trim()
  const selectedCatalogId = getQuery(event).catalogId ? String(getQuery(event).catalogId).trim() : ''

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    const tenderResult = await client.query<TenderRow>(
      'SELECT id, name FROM ausschreibungen WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [tenderId]
    )

    const tender = tenderResult.rows[0]

    if (!tender) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ausschreibung not found'
      })
    }

    const tenderSettingsResult = await client.query<TenderSettingsRow>(
      'SELECT score_min, score_max, consideration_years FROM ausschreibung_settings WHERE ausschreibung_id = $1 LIMIT 1',
      [tenderId]
    )

    const tenderChartPaletteResult = await client.query<TenderChartPaletteRow>(
      `SELECT fill_color, text_color
         FROM ausschreibung_chart_palette
         WHERE ausschreibung_id = $1
         ORDER BY position ASC`,
      [tenderId]
    )

    const settings = normalizeTenderSettingsRow(
      tenderSettingsResult.rows[0] || null,
      tenderChartPaletteResult.rows
    )

    const catalogsResult = await client.query<CriteriaCatalogRow>(
      `SELECT id, name, catalog_type, assessment_text
       FROM kriterienkataloge
       WHERE ausschreibung_id = $1
       ORDER BY position ASC, id ASC`,
      [tenderId]
    )

    const criteriaCatalogs: TenderCriteriaCatalog[] = catalogsResult.rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      type: row.catalog_type === 'main' || row.catalog_type === 'report' ? row.catalog_type : 'draft',
      assessmentText: row.assessment_text || ''
    }))

    const activeCriteriaCatalogId = selectedCatalogId && criteriaCatalogs.some((catalog) => catalog.id === selectedCatalogId)
      ? selectedCatalogId
      : (criteriaCatalogs[0]?.id || '')

    const vendorsResult = await client.query<VendorRow>(
      'SELECT id, name, project_cost_assessment, run_cost_assessment FROM anbieter WHERE ausschreibung_id = $1 ORDER BY id ASC',
      [tenderId]
    )

    const vendors: TenderVendor[] = vendorsResult.rows.map(row => ({
      id: String(row.id),
      name: row.name,
      projectCostAssessment: row.project_cost_assessment || '',
      runCostAssessment: row.run_cost_assessment || ''
    }))

    const costBlocksResult = await client.query<CostBlockRow>(
      'SELECT id, name, type FROM kostenbloecke WHERE ausschreibung_id = $1 ORDER BY id ASC',
      [tenderId]
    )

    const costBlocks: TenderCostBlock[] = costBlocksResult.rows.map(mapTenderCostBlockRow)

    const vendorIds = vendors.map((vendor) => vendor.id)
    const vendorCostItems: TenderVendorCostItem[] = vendorIds.length > 0
      ? (await client.query<VendorCostItemRow>(
        `SELECT id, anbieter_id, kostenblock_id, amount, kommentar
         FROM anbieter_kostenpositionen
         WHERE anbieter_id = ANY($1::bigint[])
         ORDER BY id ASC`,
        [vendorIds]
      )).rows.map((row) => ({
        id: String(row.id),
        vendorId: String(row.anbieter_id),
        costBlockId: String(row.kostenblock_id),
        amount: row.amount === null ? null : toNumber(row.amount),
        kommentar: row.kommentar || ''
      }))
      : []

    const firstCriteriaCatalogId = criteriaCatalogs[0]?.id || ''

    const sectionsResult = activeCriteriaCatalogId
      ? await client.query<SectionRow>(
        `SELECT id, name, weight, evaluators, description, result_assessment
         FROM abschnitte
         WHERE ausschreibung_id = $1
           AND (
             kriterienkatalog_id = $2
             OR (kriterienkatalog_id IS NULL AND $2 = $3)
           )
         ORDER BY id ASC`,
        [tenderId, activeCriteriaCatalogId, firstCriteriaCatalogId]
      )
      : { rows: [] as SectionRow[] }

    const sectionIds = sectionsResult.rows.map(row => String(row.id))
    const sectionQuestionsMap = new Map<string, Map<string, SectionQuestion[]>>()

    if (sectionIds.length > 0) {
      const questionsResult = await client.query<SectionQuestionRow>(
        `SELECT id, abschnitt_id, anbieter_id, nr, frage, punkte, kommentar, anteil, gewichtete_punkte
         FROM abschnittsfragen
         WHERE abschnitt_id = ANY($1::bigint[])
         ORDER BY id ASC`,
        [sectionIds]
      )

      for (const row of questionsResult.rows) {
        const sectionId = String(row.abschnitt_id)
        const vendorId = String(row.anbieter_id)
        const questionsByVendor = sectionQuestionsMap.get(sectionId) || new Map<string, SectionQuestion[]>()
        const questions = questionsByVendor.get(vendorId) || []

        questions.push({
          id: String(row.id),
          nr: row.nr,
          frage: row.frage,
          punkte: toNumber(row.punkte),
          kommentar: row.kommentar || '',
          anteil: toNumber(row.anteil),
          gewichtetePunkte: toNumber(row.gewichtete_punkte)
        })

        questionsByVendor.set(vendorId, questions)
        sectionQuestionsMap.set(sectionId, questionsByVendor)
      }
    }

    const sections: TenderSection[] = sectionsResult.rows.map(row => {
      const sectionId = String(row.id)
      const questionsByVendor = sectionQuestionsMap.get(sectionId) || new Map<string, SectionQuestion[]>()

      return {
        id: sectionId,
        name: row.name,
        weight: row.weight,
        evaluators: row.evaluators || '',
        description: row.description || '',
        resultAssessment: row.result_assessment || '',
        questionsByVendor: vendors.map<TenderSectionQuestionsByVendor>((vendor) => ({
          vendorId: vendor.id,
          questions: questionsByVendor.get(vendor.id) || []
        }))
      }
    })

    return {
      id: String(tender.id),
      name: tender.name,
      criteriaCatalogs,
      activeCriteriaCatalogId,
      settings,
      vendors,
      sections,
      costBlocks,
      vendorCostItems
    }
  } finally {
    client.release()
  }
})
