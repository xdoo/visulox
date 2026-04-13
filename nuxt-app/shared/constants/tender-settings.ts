import type { TenderSettings } from '../types/tenders'

export const defaultTenderChartPalette = [
  { fillColor: '#0D57A6', textColor: '#FFFFFF' },
  { fillColor: '#B47D00', textColor: '#FFFFFF' },
  { fillColor: '#083B73', textColor: '#FFFFFF' },
  { fillColor: '#7A5500', textColor: '#FFFFFF' },
  { fillColor: '#6C9FCB', textColor: '#FFFFFF' },
  { fillColor: '#D2B36A', textColor: '#FFFFFF' },
  { fillColor: '#5F7F9E', textColor: '#FFFFFF' },
  { fillColor: '#9E8A5F', textColor: '#FFFFFF' },
  { fillColor: '#6F7A53', textColor: '#FFFFFF' },
  { fillColor: '#AAB38A', textColor: '#FFFFFF' },
  { fillColor: '#4A4A4A', textColor: '#FFFFFF' },
  { fillColor: '#BDBDBD', textColor: '#FFFFFF' }
] satisfies TenderSettings['chartPalette']

export const defaultTenderSettings: TenderSettings = {
  scoreRange: [0, 10],
  considerationYears: 10,
  chartPalette: defaultTenderChartPalette
}
