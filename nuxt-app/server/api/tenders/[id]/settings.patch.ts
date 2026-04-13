import { createError, defineEventHandler, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

import { defaultTenderSettings } from '../../../../shared/constants/tender-settings'
import { getPostgresClient } from '../../../utils/postgres'
import { normalizeTenderSettingsRow } from '../../../utils/tender-general-settings'
import { loadTender } from '../../../utils/tender-settings'

import type { UpdateTenderSettingsRequest, UpdateTenderSettingsResponse } from '../../../../shared/types/tenders'

interface TenderSettingsRow {
  score_min: string | number
  score_max: string | number
  consideration_years: string | number
}

const hexColorPattern = /^#(?:[0-9a-fA-F]{6})$/

function normalizeRequest(body: Partial<UpdateTenderSettingsRequest> | null | undefined): UpdateTenderSettingsRequest {
  const scoreRange = Array.isArray(body?.scoreRange) && body.scoreRange.length === 2
    ? [Number(body.scoreRange[0]), Number(body.scoreRange[1])] as [number, number]
    : [...defaultTenderSettings.scoreRange] as [number, number]

  const chartPalette = Array.isArray(body?.chartPalette)
    ? body.chartPalette.map((entry, index) => ({
        fillColor: String(entry?.fillColor || '').trim() || defaultTenderSettings.chartPalette[index]?.fillColor || '#000000',
        textColor: String(entry?.textColor || '').trim() || '#FFFFFF'
      }))
    : [...defaultTenderSettings.chartPalette]
  const considerationYears = Number(body?.considerationYears ?? defaultTenderSettings.considerationYears)

  return {
    scoreRange,
    considerationYears,
    chartPalette
  }
}

function validateRequest(payload: UpdateTenderSettingsRequest) {
  const [scoreMin, scoreMax] = payload.scoreRange

  if (!Number.isFinite(scoreMin) || !Number.isFinite(scoreMax) || scoreMin >= scoreMax) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Die Bewertungsskala ist ungültig.'
    })
  }

  if (payload.chartPalette.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Die Farbpalette darf nicht leer sein.'
    })
  }

  if (payload.chartPalette.some(entry => !hexColorPattern.test(entry.fillColor) || !hexColorPattern.test(entry.textColor))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Die Farbpalette enthält ungültige Farbwerte.'
    })
  }

  if (!Number.isFinite(payload.considerationYears) || payload.considerationYears < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Der Betrachtungszeitraum ist ungültig.'
    })
  }
}

export default defineEventHandler(async (event): Promise<UpdateTenderSettingsResponse> => {
  const tenderId = event.context.params?.id?.trim()

  if (!tenderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ausschreibung id is required'
    })
  }

  const payload = normalizeRequest(await readBody<Partial<UpdateTenderSettingsRequest>>(event))
  validateRequest(payload)

  const config = useRuntimeConfig(event)
  const client = await getPostgresClient(config.databaseUrl)

  try {
    await client.query('BEGIN')

    const tender = await loadTender(client, tenderId)

    if (!tender) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ausschreibung wurde nicht gefunden.'
      })
    }

    const result = await client.query<TenderSettingsRow>(
      `INSERT INTO ausschreibung_settings (ausschreibung_id, score_min, score_max, consideration_years)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (ausschreibung_id)
       DO UPDATE SET score_min = EXCLUDED.score_min, score_max = EXCLUDED.score_max, consideration_years = EXCLUDED.consideration_years
       RETURNING score_min, score_max, consideration_years`,
      [
        tenderId,
        payload.scoreRange[0],
        payload.scoreRange[1],
        payload.considerationYears
      ]
    )

    await client.query(
      'DELETE FROM ausschreibung_chart_palette WHERE ausschreibung_id = $1',
      [tenderId]
    )

    for (const [index, entry] of payload.chartPalette.entries()) {
      await client.query(
        `INSERT INTO ausschreibung_chart_palette (ausschreibung_id, position, fill_color, text_color)
         VALUES ($1, $2, $3, $4)`,
        [tenderId, index, entry.fillColor, entry.textColor]
      )
    }

    const paletteResult = await client.query<{ fill_color: string, text_color: string }>(
      `SELECT fill_color, text_color
         FROM ausschreibung_chart_palette
         WHERE ausschreibung_id = $1
         ORDER BY position ASC`,
      [tenderId]
    )

    await client.query('COMMIT')

    return {
      settings: normalizeTenderSettingsRow(result.rows[0] || null, paletteResult.rows)
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})
