import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { getPostgresClient } from '../../../utils/postgres'

import type { PoolClient } from 'pg'
import type {
  AbschnittFrage,
  AbschnittFrageInput,
  SaveAbschnittFragenRequest,
  SaveAbschnittFragenResponse
} from '../../../../shared/types/ausschreibungen'

interface AbschnittRow {
  id: string | number
  weight: number
}

interface AbschnittFrageRow {
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

function normalizeQuestion(input: Partial<AbschnittFrageInput>, index: number): AbschnittFrageInput {
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

function mapQuestionRow(row: AbschnittFrageRow): AbschnittFrage {
  return {
    id: String(row.id),
    nr: row.nr,
    frage: row.frage,
    punkte: toNumber(row.punkte),
    anteil: toNumber(row.anteil),
    gewichtetePunkte: toNumber(row.gewichtete_punkte)
  }
}

async function loadAbschnitt(client: Pick<PoolClient, 'query'>, abschnittId: string) {
  const result = await client.query<AbschnittRow>(
    'SELECT id, weight FROM abschnitte WHERE id = $1 LIMIT 1',
    [abschnittId]
  )

  return result.rows[0] || null
}

async function saveQuestions(client: Pick<PoolClient, 'query'>, abschnittId: string, questions: AbschnittFrageInput[]) {
  await client.query('DELETE FROM abschnittsfragen WHERE abschnitt_id = $1', [abschnittId])

  const savedQuestions: AbschnittFrage[] = []

  for (const question of questions) {
    const gewichtetePunkte = Number((question.punkte * question.anteil).toFixed(4))
    const result = await client.query<AbschnittFrageRow>(
      `INSERT INTO abschnittsfragen (abschnitt_id, nr, frage, punkte, anteil, gewichtete_punkte)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nr, frage, punkte, anteil, gewichtete_punkte`,
      [abschnittId, question.nr, question.frage, question.punkte, question.anteil, gewichtetePunkte]
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

export default defineEventHandler(async (event): Promise<SaveAbschnittFragenResponse> => {
  const abschnittId = event.context.params?.id?.trim()

  if (!abschnittId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Abschnitt id is required'
    })
  }

  const body = await readBody<Partial<SaveAbschnittFragenRequest>>(event)
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

    const abschnitt = await loadAbschnitt(client, abschnittId)

    if (!abschnitt) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Abschnitt not found'
      })
    }

    const totalAnteil = questions.reduce((sum, question) => sum + question.anteil, 0)
    const totalPercentage = totalAnteil * 100

    if (Math.abs(totalPercentage - abschnitt.weight) > 0.0001) {
      throw createError({
        statusCode: 400,
        statusMessage: `Question anteil sum ${totalPercentage.toFixed(2).replace(/\.?0+$/, '')}% does not match abschnitt weight ${abschnitt.weight}%`
      })
    }

    const savedQuestions = await saveQuestions(client, abschnittId, questions)

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
