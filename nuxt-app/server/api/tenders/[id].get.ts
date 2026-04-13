import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'
import { normalizeTenderSettingsRow } from '../../utils/tender-general-settings'
import { mapTenderCostBlockRow } from '../../utils/tender-cost-blocks'

import type {
  SectionQuestion,
  TenderCostBlock,
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
  chart_palette: string[] | null
}

interface VendorRow {
  id: string | number
  name: string
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
}

interface SectionRow {
  id: string | number
  name: string
  weight: number
}

interface SectionQuestionRow {
  id: string | number
  abschnitt_id: string | number
  anbieter_id: string | number
  nr: string
  frage: string
  punkte: string | number
  anteil: string | number
  gewichtete_punkte: string | number
}

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : Number(value)
}

export default defineEventHandler(async (event): Promise<TenderDetail> => {
  const tenderId = event.context.params?.id?.trim()

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
      'SELECT id, name FROM ausschreibungen WHERE id = $1 LIMIT 1',
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
      'SELECT score_min, score_max, consideration_years, chart_palette FROM ausschreibung_settings WHERE ausschreibung_id = $1 LIMIT 1',
      [tenderId]
    )

    const settings = normalizeTenderSettingsRow(tenderSettingsResult.rows[0] || null)

    const vendorsResult = await client.query<VendorRow>(
      'SELECT id, name FROM anbieter WHERE ausschreibung_id = $1 ORDER BY id ASC',
      [tenderId]
    )

    const vendors: TenderVendor[] = vendorsResult.rows.map(row => ({
      id: String(row.id),
      name: row.name
    }))

    const costBlocksResult = await client.query<CostBlockRow>(
      'SELECT id, name, type FROM kostenbloecke WHERE ausschreibung_id = $1 ORDER BY id ASC',
      [tenderId]
    )

    const costBlocks: TenderCostBlock[] = costBlocksResult.rows.map(mapTenderCostBlockRow)

    const vendorIds = vendors.map((vendor) => vendor.id)
    const vendorCostItems: TenderVendorCostItem[] = vendorIds.length > 0
      ? (await client.query<VendorCostItemRow>(
        `SELECT id, anbieter_id, kostenblock_id, amount
         FROM anbieter_kostenpositionen
         WHERE anbieter_id = ANY($1::bigint[])
         ORDER BY id ASC`,
        [vendorIds]
      )).rows.map((row) => ({
        id: String(row.id),
        vendorId: String(row.anbieter_id),
        costBlockId: String(row.kostenblock_id),
        amount: row.amount === null ? null : toNumber(row.amount)
      }))
      : []

    const sectionsResult = await client.query<SectionRow>(
      'SELECT id, name, weight FROM abschnitte WHERE ausschreibung_id = $1 ORDER BY id ASC',
      [tenderId]
    )

    const sectionIds = sectionsResult.rows.map(row => String(row.id))
    const sectionQuestionsMap = new Map<string, Map<string, SectionQuestion[]>>()

    if (sectionIds.length > 0) {
      const questionsResult = await client.query<SectionQuestionRow>(
        `SELECT id, abschnitt_id, anbieter_id, nr, frage, punkte, anteil, gewichtete_punkte
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
        questionsByVendor: vendors.map<TenderSectionQuestionsByVendor>((vendor) => ({
          vendorId: vendor.id,
          questions: questionsByVendor.get(vendor.id) || []
        }))
      }
    })

    return {
      id: String(tender.id),
      name: tender.name,
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
