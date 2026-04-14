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
  normalizedCost: number | null
  balancedScore: number | null
  costFocusScore: number | null
  utilityFocusScore: number | null
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

export function calculateWeightedScore(
  normalizedUtility: number,
  normalizedCost: number | null,
  utilityWeight: number,
  costWeight: number
) {
  if (normalizedCost === null) {
    return null
  }

  return roundValue((utilityWeight * normalizedUtility) + (costWeight * normalizedCost))
}

export function getHighestScoreValue(
  rows: TenderValueScoreRow[],
  key: 'balancedScore' | 'costFocusScore' | 'utilityFocusScore'
) {
  const scores = rows
    .map((row) => row[key])
    .filter((value): value is number => value !== null)

  return scores.length > 0 ? Math.max(...scores) : null
}

export function formatNormalizedCost(value: number | null) {
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

  const cheapestCost = Math.min(
    Number.POSITIVE_INFINITY,
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
    const hasValidCost = Number.isFinite(totalCost) && totalCost > 0 && Number.isFinite(cheapestCost)
    const normalizedCost = hasValidCost ? roundValue(cheapestCost / totalCost) : null
    const balancedScore = calculateWeightedScore(normalizedUtility, normalizedCost, 0.5, 0.5)
    const costFocusScore = calculateWeightedScore(normalizedUtility, normalizedCost, 0.4, 0.6)
    const utilityFocusScore = calculateWeightedScore(normalizedUtility, normalizedCost, 0.6, 0.4)

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      utilityPercentage: roundValue(utilityPercentage, 2),
      normalizedUtility,
      totalCost: hasValidCost ? roundValue(totalCost, 2) : null,
      normalizedCost,
      balancedScore,
      costFocusScore,
      utilityFocusScore,
      rank: null,
      hasQuestions
    }
  })

  const sortedRows = [...rows].sort((left, right) => {
    if (left.balancedScore === null && right.balancedScore === null) {
      return left.vendorName.localeCompare(right.vendorName, 'de')
    }

    if (left.balancedScore === null) {
      return 1
    }

    if (right.balancedScore === null) {
      return -1
    }

    if (right.balancedScore !== left.balancedScore) {
      return right.balancedScore - left.balancedScore
    }

    if (right.utilityPercentage !== left.utilityPercentage) {
      return right.utilityPercentage - left.utilityPercentage
    }

    return left.vendorName.localeCompare(right.vendorName, 'de')
  })

  return sortedRows.map((row, index) => ({
    ...row,
    rank: row.balancedScore === null ? null : index + 1
  }))
}
