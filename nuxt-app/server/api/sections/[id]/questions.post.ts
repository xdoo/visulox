import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

import type { PoolClient } from 'pg'
import type {
  SectionQuestion,
  SectionQuestionInput,
  SaveSectionQuestionsRequest,
  SaveSectionQuestionsResponse
} from '../../../../shared/types/tenders'

interface SectionRow {
  id: string | number
  ausschreibung_id: string | number
  weight: number
}

interface VendorRow {
  id: string | number
  ausschreibung_id: string | number
}

interface SavedSectionQuestionRow {
  id: string | number
  nr: string
  frage: string
  punkte: string | number
  anteil: string | number
  gewichtete_punkte: string | number
}

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : Number(value)
}

function normalizeQuestion(input: Partial<SectionQuestionInput>, index: number): SectionQuestionInput {
  const nr = input.nr?.trim() || ''
  const frage = input.frage?.trim() || ''
  const punkte = input.punkte
  const anteil = input.anteil

  if (!nr) {
    throw createError({
      statusCode: 400,
      statusMessage: `Question ${index + 1}: nr is required`
    })
  }

  if (!frage) {
    throw createError({
      statusCode: 400,
      statusMessage: `Question ${index + 1}: frage is required`
    })
  }

  if (typeof punkte !== 'number' || !Number.isFinite(punkte)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Question ${index + 1}: punkte must be a number`
    })
  }

  if (typeof anteil !== 'number' || !Number.isFinite(anteil)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Question ${index + 1}: anteil must be a number`
    })
  }

  return {
    nr,
    frage,
    punkte,
    anteil
  }
}

function findDuplicateQuestionNumber(questions: SectionQuestionInput[]) {
  const seenNumbers = new Set<string>()

  for (const question of questions) {
    if (seenNumbers.has(question.nr)) {
      return question.nr
    }

    seenNumbers.add(question.nr)
  }

  return null
}

function mapQuestionRow(row: SavedSectionQuestionRow): SectionQuestion {
  return {
    id: String(row.id),
    nr: row.nr,
    frage: row.frage,
    punkte: toNumber(row.punkte),
    anteil: toNumber(row.anteil),
    gewichtetePunkte: toNumber(row.gewichtete_punkte)
  }
}

async function loadSection(client: Pick<PoolClient, 'query'>, sectionId: string) {
  const result = await client.query<SectionRow>(
    'SELECT id, ausschreibung_id, weight FROM abschnitte WHERE id = $1 LIMIT 1',
    [sectionId]
  )

  return result.rows[0] || null
}

async function loadVendor(client: Pick<PoolClient, 'query'>, vendorId: string) {
  const result = await client.query<VendorRow>(
    'SELECT id, ausschreibung_id FROM anbieter WHERE id = $1 LIMIT 1',
    [vendorId]
  )

  return result.rows[0] || null
}

async function saveQuestions(
  client: Pick<PoolClient, 'query'>,
  sectionId: string,
  vendorId: string,
  questions: SectionQuestionInput[]
) {
  await client.query('DELETE FROM abschnittsfragen WHERE abschnitt_id = $1 AND anbieter_id = $2', [sectionId, vendorId])

  const savedQuestions: SectionQuestion[] = []

  for (const question of questions) {
    const gewichtetePunkte = Number((question.punkte * question.anteil).toFixed(4))
    const result = await client.query<SavedSectionQuestionRow>(
      `INSERT INTO abschnittsfragen (abschnitt_id, anbieter_id, nr, frage, punkte, anteil, gewichtete_punkte)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nr, frage, punkte, anteil, gewichtete_punkte`,
      [sectionId, vendorId, question.nr, question.frage, question.punkte, question.anteil, gewichtetePunkte]
    )

    const row = result.rows[0]

    if (!row) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Question could not be saved'
      })
    }

    savedQuestions.push(mapQuestionRow(row))
  }

  return savedQuestions
}

export default defineEventHandler(async (event): Promise<SaveSectionQuestionsResponse> => {
  const sectionId = event.context.params?.id?.trim()

  if (!sectionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnitt id is required'
    })
  }

  const body = await readBody<Partial<SaveSectionQuestionsRequest>>(event)
  const vendorId = body?.vendorId?.trim() || ''
  const questionsInput = Array.isArray(body?.questions) ? body.questions : []

  if (!vendorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anbieter id is required'
    })
  }

  if (questionsInput.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one question is required'
    })
  }

  const questions = questionsInput.map((question, index) => normalizeQuestion(question, index))
  const duplicateNumber = findDuplicateQuestionNumber(questions)

  if (duplicateNumber) {
    throw createError({
      statusCode: 400,
      statusMessage: `Question nr "${duplicateNumber}" is duplicated`
    })
  }

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const section = await loadSection(client, sectionId)

    if (!section) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Abschnitt not found'
      })
    }

    const vendor = await loadVendor(client, vendorId)

    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Anbieter not found'
      })
    }

    if (String(section.ausschreibung_id) !== String(vendor.ausschreibung_id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Abschnitt and Anbieter do not belong to the same Ausschreibung'
      })
    }

    const totalAnteil = questions.reduce((sum, question) => sum + question.anteil, 0)
    const totalPercentage = totalAnteil * 100

    if (Math.abs(totalPercentage - section.weight) > 0.0001) {
      throw createError({
        statusCode: 400,
        statusMessage: `Question anteil sum ${totalPercentage.toFixed(2).replace(/\.?0+$/, '')}% does not match abschnitt weight ${section.weight}%`
      })
    }

    const savedQuestions = await saveQuestions(client, sectionId, vendorId, questions)

    await client.query('COMMIT')

    return {
      questions: savedQuestions
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
