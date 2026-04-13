import { defaultTenderSettings } from '../../shared/constants/tender-settings'

import type { TenderSettings } from '../../shared/types/tenders'

interface TenderSettingsRow {
  score_min: number | string
  score_max: number | string
  consideration_years: number | string
  chart_palette: string[] | null
}

function toNumber(value: string | number) {
  return typeof value === 'number' ? value : Number(value)
}

export function normalizeTenderSettingsRow(row?: TenderSettingsRow | null): TenderSettings {
  if (!row) {
    return {
      scoreRange: [...defaultTenderSettings.scoreRange] as TenderSettings['scoreRange'],
      considerationYears: defaultTenderSettings.considerationYears,
      chartPalette: [...defaultTenderSettings.chartPalette]
    }
  }

  return {
    scoreRange: [toNumber(row.score_min), toNumber(row.score_max)],
    considerationYears: toNumber(row.consideration_years),
    chartPalette: Array.isArray(row.chart_palette) && row.chart_palette.length > 0
      ? row.chart_palette
      : [...defaultTenderSettings.chartPalette]
  }
}
