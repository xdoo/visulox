import { describe, expect, it } from 'vitest'

import { buildTenderManagementSummary } from '../app/composables/useTenderManagementSummary'

import type { TenderValueScoreRow } from '../app/composables/useTenderValueScore'

function row(
  vendorName: string,
  balancedScore: number,
  costFocusScore: number,
  utilityFocusScore: number,
  totalCost: number
): TenderValueScoreRow {
  return {
    vendorId: vendorName,
    vendorName,
    utilityPercentage: balancedScore * 100,
    normalizedUtility: balancedScore,
    totalCost,
    normalizedCost: 1,
    balancedScore,
    costFocusScore,
    utilityFocusScore,
    rank: null,
    hasQuestions: true
  }
}

describe('buildTenderManagementSummary', () => {
  it('builds a stable shortlist summary with cost range and significant gap', () => {
    const summary = buildTenderManagementSummary([
      row('A', 0.9, 0.88, 0.92, 1000000),
      row('B', 0.8, 0.82, 0.81, 1500000),
      row('C', 0.7, 0.71, 0.74, 1200000),
      row('D', 0.6, 0.59, 0.58, 2000000)
    ])

    expect(summary.topVendors).toEqual(['A', 'B', 'C'])
    expect(summary.minCost).toBe('1.000.000 €')
    expect(summary.maxCost).toBe('2.000.000 €')
    expect(summary.hasSignificantGap).toBe(true)
    expect(summary.isShortlistStable).toBe(true)
    expect(summary.sensitivitySentence).toBe(
      'Die Sensitivitätsanalyse zeigt, dass die identifizierte Shortlist auch bei veränderter Gewichtung von Kosten und Nutzen stabil bleibt.'
    )
  })

  it('detects unstable shortlists when sensitivity rankings change the top 3', () => {
    const summary = buildTenderManagementSummary([
      row('A', 0.9, 0.88, 0.92, 1000000),
      row('B', 0.8, 0.82, 0.81, 1500000),
      row('C', 0.7, 0.69, 0.74, 1200000),
      row('D', 0.68, 0.75, 0.58, 2000000)
    ])

    expect(summary.topVendors).toEqual(['A', 'B', 'C'])
    expect(summary.hasSignificantGap).toBe(false)
    expect(summary.isShortlistStable).toBe(false)
    expect(summary.sensitivitySentence).toBe(
      'Bei veränderter Gewichtung von Kosten und Nutzen ergeben sich Verschiebungen in der Rangfolge, die Zusammensetzung der Shortlist ist jedoch nicht vollständig stabil.'
    )
  })
})
