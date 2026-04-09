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
  weight: number
}

interface SectionQuestionRow {
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

function mapQuestionRow(row: SectionQuestionRow): SectionQuestion {
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
    'SELECT id, weight FROM abschnitte WHERE id = $1 LIMIT 1',
    [sectionId]
  )

  return result.rows[0] || null
}

async function saveQuestions(client: Pick<PoolClient, 'query'>, sectionId: string, questions: SectionQuestionInput[]) {
  await client.query('DELETE FROM abschnittsfragen WHERE abschnitt_id = $1', [sectionId])

  const savedQuestions: SectionQuestion[] = []

  for (const question of questions) {
    const gewichtetePunkte = Number((question.punkte * question.anteil).toFixed(4))
    const result = await client.query<SectionQuestionRow>(
      `INSERT INTO abschnittsfragen (abschnitt_id, nr, frage, punkte, anteil, gewichtete_punkte)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nr, frage, punkte, anteil, gewichtete_punkte`,
      [sectionId, question.nr, question.frage, question.punkte, question.anteil, gewichtetePunkte]
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
  const questionsInput = Array.isArray(body?.questions) ? body.questions : []

  if (questionsInput.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one question is required'
    })
  }

  const questions = questionsInput.map((question, index) => normalizeQuestion(question, index))
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

    const totalAnteil = questions.reduce((sum, question) => sum + question.anteil, 0)
    const totalPercentage = totalAnteil * 100

    if (Math.abs(totalPercentage - section.weight) > 0.0001) {
      throw createError({
        statusCode: 400,
        statusMessage: `Question anteil sum ${totalPercentage.toFixed(2).replace(/\.?0+$/, '')}% does not match abschnitt weight ${section.weight}%`
      })
    }

    const savedQuestions = await saveQuestions(client, sectionId, questions)

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
