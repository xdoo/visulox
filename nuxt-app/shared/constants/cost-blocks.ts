import type { TenderCostBlockType } from '../types/tenders'

export const tenderCostBlockTypeLabels: Record<TenderCostBlockType, string> = {
  license_one_time: 'Lizenzkosten (einmalig)',
  project: 'Projektkosten',
  vendor_operating: 'Herstellerbezogene Betriebskosten',
  infrastructure: 'Infrastrukturkosten'
}

export const tenderCostBlockTypeOptions = Object.entries(tenderCostBlockTypeLabels).map(([value, label]) => ({
  value: value as TenderCostBlockType,
  label
}))

