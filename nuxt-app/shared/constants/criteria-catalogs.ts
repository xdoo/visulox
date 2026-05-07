import type { TenderCriteriaCatalogType } from '../types/tenders'

export const tenderCriteriaCatalogTypeOptions: Array<{
  label: string
  value: TenderCriteriaCatalogType
}> = [
  { label: 'Hauptkatalog', value: 'main' },
  { label: 'Berichtskatalog', value: 'report' },
  { label: 'Draft', value: 'draft' }
]

export function getTenderCriteriaCatalogTypeLabel(type: TenderCriteriaCatalogType) {
  return tenderCriteriaCatalogTypeOptions.find((option) => option.value === type)?.label || 'Draft'
}
