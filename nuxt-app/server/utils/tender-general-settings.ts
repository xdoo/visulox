import { defaultTenderSettings } from '../../shared/constants/tender-settings'

import type { TenderSettings } from '../../shared/types/tenders'

interface TenderSettingsRow {
  score_min: number | string
  score_max: number | string
  consideration_years: number | string
}

interface TenderChartPaletteRow {
  fill_color: string
  text_color: string
}

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : Number(value)
}

export function normalizeTenderSettingsRow(
  row?: TenderSettingsRow | null,
  paletteRows?: TenderChartPaletteRow[]
): TenderSettings {
  if (!row) {
    return {
      scoreRange: [...defaultTenderSettings.scoreRange] as TenderSettings['scoreRange'],
      considerationYears: defaultTenderSettings.considerationYears,
      chartPalette: defaultTenderSettings.chartPalette.map((entry) => ({ ...entry }))
    }
  }
  const normalizedPalette = Array.isArray(paletteRows) && paletteRows.length > 0
    ? paletteRows.map((row) => ({
        fillColor: row.fill_color,
        textColor: row.text_color || '#FFFFFF'
      }))
    : defaultTenderSettings.chartPalette.map((entry) => ({ ...entry }))

  return {
    scoreRange: [toNumber(row.score_min), toNumber(row.score_max)],
    considerationYears: toNumber(row.consideration_years),
    chartPalette: normalizedPalette
  }
}
