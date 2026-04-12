import { createError } from 'h3'

import { tenderCostBlockTypeLabels } from '../../shared/constants/cost-blocks'

import type { TenderCostBlockType } from '../../shared/types/tenders'

interface CostBlockRow {
  id: string | number
  name: string
  type: string
}

export function parseTenderCostBlockType(value: string | undefined | null): TenderCostBlockType {
  const normalizedValue = value?.trim() || ''

  if (normalizedValue in tenderCostBlockTypeLabels) {
    return normalizedValue as TenderCostBlockType
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Ungültige Kostenart.'
  })
}

export function mapTenderCostBlockRow(row: CostBlockRow) {
  return {
    id: String(row.id),
    name: row.name,
    type: parseTenderCostBlockType(row.type)
  }
}
