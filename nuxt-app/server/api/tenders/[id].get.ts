import { createError, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../utils/postgres'

import type { SectionQuestion, TenderDetail, TenderSection, TenderVendor } from '../../../shared/types/tenders'

interface TenderRow {
  id: string | number
  name: string
}

interface VendorRow {
  id: string | number
  name: string
}

interface SectionRow {
  id: string | number
  name: string
  weight: number
}

interface SectionQuestionRow {
  id: string | number
  abschnitt_id: string | number
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

    const vendorsResult = await client.query<VendorRow>(
      'SELECT id, name FROM anbieter WHERE ausschreibung_id = $1 ORDER BY id ASC',
      [tenderId]
    )

    const vendors: TenderVendor[] = vendorsResult.rows.map(row => ({
      id: String(row.id),
      name: row.name
    }))

    const sectionsResult = await client.query<SectionRow>(
      'SELECT id, name, weight FROM abschnitte WHERE ausschreibung_id = $1 ORDER BY id ASC',
      [tenderId]
    )

    const sectionIds = sectionsResult.rows.map(row => String(row.id))
    const sectionQuestionsMap = new Map<string, SectionQuestion[]>()

    if (sectionIds.length > 0) {
      const questionsResult = await client.query<SectionQuestionRow>(
        `SELECT id, abschnitt_id, nr, frage, punkte, anteil, gewichtete_punkte
         FROM abschnittsfragen
         WHERE abschnitt_id = ANY($1::bigint[])
         ORDER BY id ASC`,
        [sectionIds]
      )

      for (const row of questionsResult.rows) {
        const sectionId = String(row.abschnitt_id)
        const questions = sectionQuestionsMap.get(sectionId) || []

        questions.push({
          id: String(row.id),
          nr: row.nr,
          frage: row.frage,
          punkte: toNumber(row.punkte),
          anteil: toNumber(row.anteil),
          gewichtetePunkte: toNumber(row.gewichtete_punkte)
        })

        sectionQuestionsMap.set(sectionId, questions)
      }
    }

    const sections: TenderSection[] = sectionsResult.rows.map(row => {
      const sectionId = String(row.id)

      return {
        id: sectionId,
        name: row.name,
        weight: row.weight,
        questions: sectionQuestionsMap.get(sectionId) || []
      }
    })

    return {
      id: String(tender.id),
      name: tender.name,
      vendors,
      sections
    }
  } finally {
    client.release()
  }
})
