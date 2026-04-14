import {
  buildCombinedVendorCostOverviewRows,
  buildVendorCostOverviewRows,
  formatCostChartValue
} from './useTenderCostOverview'
import { calculateSectionContributionPercentage } from './useCriteriaSectionFulfillment'

import type {
  TenderCostBlock,
  TenderSection,
  TenderSettings,
  TenderVendor,
  TenderVendorCostItem
} from '../../shared/types/tenders'

export interface TenderValueScoreRow {
  vendorId: string
  vendorName: string
  utilityPercentage: number
  normalizedUtility: number
  totalCost: number | null
  costFactor: number | null
  valueScore: number | null
  rank: number | null
  hasQuestions: boolean
}

function roundValue(value: number, digits = 4) {
  return Number(value.toFixed(digits))
}

export function formatValueScore(value: number | null) {
  if (value === null) {
    return 'Nicht berechenbar'
  }

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function formatCostFactor(value: number | null) {
  if (value === null) {
    return 'Nicht berechenbar'
  }

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function formatUtilityPercentage(value: number) {
  return `${Math.round(value)}%`
}

export function formatValueScoreCost(value: number | null) {
  return value === null ? 'Nicht berechenbar' : `${formatCostChartValue(value)} €`
}

export function buildTenderValueScoreRows(
  vendors: TenderVendor[],
  sections: TenderSection[],
  scoreRange: TenderSettings['scoreRange'],
  costBlocks: TenderCostBlock[],
  vendorCostItems: TenderVendorCostItem[],
  considerationYears: TenderSettings['considerationYears']
) {
  const costRows = buildVendorCostOverviewRows(vendors, costBlocks, vendorCostItems, considerationYears)
  const combinedCostRows = buildCombinedVendorCostOverviewRows(costRows)
  const totalCostByVendorId = new Map(combinedCostRows.map((row) => [row.vendorId, row.total]))

  const maxCost = Math.max(
    0,
    ...combinedCostRows
      .map((row) => row.total)
      .filter((total) => Number.isFinite(total) && total > 0)
  )

  const rows = vendors.map<TenderValueScoreRow>((vendor) => {
    let utilityPercentage = 0
    let hasQuestions = false

    sections.forEach((section) => {
      const vendorQuestions = section.questionsByVendor.find((entry) => entry.vendorId === vendor.id)?.questions || []

      if (vendorQuestions.length > 0) {
        hasQuestions = true
      }

      utilityPercentage += calculateSectionContributionPercentage(
        vendorQuestions,
        section.weight,
        scoreRange
      ) || 0
    })

    const normalizedUtility = roundValue(utilityPercentage / 100)
    const totalCost = totalCostByVendorId.get(vendor.id) || 0
    const hasValidCost = Number.isFinite(totalCost) && totalCost > 0 && maxCost > 0
    const costFactor = hasValidCost ? roundValue(maxCost / totalCost) : null
    const valueScore = costFactor === null ? null : roundValue(normalizedUtility * costFactor)

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      utilityPercentage: roundValue(utilityPercentage, 2),
      normalizedUtility,
      totalCost: hasValidCost ? roundValue(totalCost, 2) : null,
      costFactor,
      valueScore,
      rank: null,
      hasQuestions
    }
  })

  const sortedRows = [...rows].sort((left, right) => {
    if (left.valueScore === null && right.valueScore === null) {
      return left.vendorName.localeCompare(right.vendorName, 'de')
    }

    if (left.valueScore === null) {
      return 1
    }

    if (right.valueScore === null) {
      return -1
    }

    if (right.valueScore !== left.valueScore) {
      return right.valueScore - left.valueScore
    }

    if (right.utilityPercentage !== left.utilityPercentage) {
      return right.utilityPercentage - left.utilityPercentage
    }

    return left.vendorName.localeCompare(right.vendorName, 'de')
  })

  return sortedRows.map((row, index) => ({
    ...row,
    rank: row.valueScore === null ? null : index + 1
  }))
}
