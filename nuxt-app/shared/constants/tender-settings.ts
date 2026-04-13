import type { TenderSettings } from '../types/tenders'

export const defaultTenderChartPalette = [
  '#0D57A6', '#B47D00',
  '#083B73', '#7A5500',
  '#6C9FCB', '#D2B36A',
  '#5F7F9E', '#9E8A5F',
  '#6F7A53', '#AAB38A',
  '#4A4A4A', '#BDBDBD'
] satisfies TenderSettings['chartPalette']

export const defaultTenderSettings: TenderSettings = {
  scoreRange: [0, 10],
  considerationYears: 10,
  chartPalette: defaultTenderChartPalette
}
