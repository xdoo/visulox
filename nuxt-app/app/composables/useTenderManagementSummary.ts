import { formatValueScoreCost } from './useTenderValueScore'

import type { TenderValueScoreRow } from './useTenderValueScore'

export const SIGNIFICANT_SHORTLIST_GAP = 0.05

type ScoreKey = 'balancedScore' | 'costFocusScore' | 'utilityFocusScore'

export interface TenderManagementSummary {
  topVendors: [string, string, string] | null
  minCost: string
  maxCost: string
  hasSignificantGap: boolean
  isShortlistStable: boolean
  sensitivitySentence: string
}

function sortByScore(rows: TenderValueScoreRow[], key: ScoreKey) {
  return [...rows]
    .filter((row): row is TenderValueScoreRow & Record<ScoreKey, number> => row[key] !== null)
    .sort((left, right) => {
      const scoreDifference = right[key] - left[key]

      if (scoreDifference !== 0) {
        return scoreDifference
      }

      if (right.utilityPercentage !== left.utilityPercentage) {
        return right.utilityPercentage - left.utilityPercentage
      }

      return left.vendorName.localeCompare(right.vendorName, 'de')
    })
}

function getTopVendorNames(rows: TenderValueScoreRow[], key: ScoreKey) {
  return sortByScore(rows, key).slice(0, 3).map((row) => row.vendorName)
}

function haveSameShortlist(left: string[], right: string[]) {
  if (left.length !== 3 || right.length !== 3) {
    return false
  }

  const rightSet = new Set(right)
  return left.every((vendorName) => rightSet.has(vendorName))
}

export function buildTenderManagementSummary(rows: TenderValueScoreRow[]): TenderManagementSummary {
  const balancedRows = sortByScore(rows, 'balancedScore')
  const topVendors = balancedRows.length >= 3
    ? [
        balancedRows[0]!.vendorName,
        balancedRows[1]!.vendorName,
        balancedRows[2]!.vendorName
      ] satisfies [string, string, string]
    : null
  const costs = rows
    .map((row) => row.totalCost)
    .filter((cost): cost is number => cost !== null && Number.isFinite(cost))
  const balancedTop3 = getTopVendorNames(rows, 'balancedScore')
  const costFocusTop3 = getTopVendorNames(rows, 'costFocusScore')
  const utilityFocusTop3 = getTopVendorNames(rows, 'utilityFocusScore')
  const isShortlistStable = haveSameShortlist(balancedTop3, costFocusTop3)
    && haveSameShortlist(balancedTop3, utilityFocusTop3)
  const thirdScore = balancedRows[2]?.balancedScore
  const fourthScore = balancedRows[3]?.balancedScore

  return {
    topVendors,
    minCost: costs.length > 0 ? formatValueScoreCost(Math.min(...costs)) : formatValueScoreCost(null),
    maxCost: costs.length > 0 ? formatValueScoreCost(Math.max(...costs)) : formatValueScoreCost(null),
    hasSignificantGap: typeof thirdScore === 'number'
      && typeof fourthScore === 'number'
      && thirdScore - fourthScore >= SIGNIFICANT_SHORTLIST_GAP,
    isShortlistStable,
    sensitivitySentence: isShortlistStable
      ? 'Die Sensitivitätsanalyse zeigt, dass die identifizierte Shortlist auch bei veränderter Gewichtung von Kosten und Nutzen stabil bleibt.'
      : 'Bei veränderter Gewichtung von Kosten und Nutzen ergeben sich Verschiebungen in der Rangfolge, die Zusammensetzung der Shortlist ist jedoch nicht vollständig stabil.'
  }
}
