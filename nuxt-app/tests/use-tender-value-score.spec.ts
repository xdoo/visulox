import { describe, expect, it } from 'vitest'

import {
  buildTenderValueScoreRows,
  calculateWeightedScore,
  formatNormalizedCost,
  formatUtilityPercentage,
  formatValueScore,
  formatValueScoreCost,
  getHighestScoreValue
} from '../app/composables/useTenderValueScore'

describe('useTenderValueScore', () => {
  it('builds ranked value score rows from utility and total costs', () => {
    const rows = buildTenderValueScoreRows(
      [
        { id: '1', name: 'Alpha' },
        { id: '2', name: 'Beta' },
        { id: '3', name: 'Gamma' }
      ],
      [
        {
          id: '10',
          name: 'Funktional',
          weight: 60,
          questionsByVendor: [
            {
              vendorId: '1',
              questions: [
                { id: 'q1', nr: '1', frage: 'A', punkte: 8, anteil: 0.36, gewichtetePunkte: 0 },
                { id: 'q2', nr: '2', frage: 'B', punkte: 6, anteil: 0.24, gewichtetePunkte: 0 }
              ]
            },
            {
              vendorId: '2',
              questions: [
                { id: 'q3', nr: '1', frage: 'A', punkte: 7, anteil: 0.36, gewichtetePunkte: 0 },
                { id: 'q4', nr: '2', frage: 'B', punkte: 7, anteil: 0.24, gewichtetePunkte: 0 }
              ]
            },
            {
              vendorId: '3',
              questions: []
            }
          ]
        },
        {
          id: '11',
          name: 'Betrieb',
          weight: 40,
          questionsByVendor: [
            {
              vendorId: '1',
              questions: [
                { id: 'q5', nr: '1', frage: 'C', punkte: 9, anteil: 0.4, gewichtetePunkte: 0 }
              ]
            },
            {
              vendorId: '2',
              questions: [
                { id: 'q6', nr: '1', frage: 'C', punkte: 5, anteil: 0.4, gewichtetePunkte: 0 }
              ]
            },
            {
              vendorId: '3',
              questions: []
            }
          ]
        }
      ],
      [0, 10],
      [
        { id: '100', name: 'Projekt', type: 'project' },
        { id: '101', name: 'Hosting', type: 'infrastructure' }
      ],
      [
        { id: 'c1', vendorId: '1', costBlockId: '100', amount: 4_000_000 },
        { id: 'c2', vendorId: '1', costBlockId: '101', amount: 200_000 },
        { id: 'c3', vendorId: '2', costBlockId: '100', amount: 3_000_000 },
        { id: 'c4', vendorId: '2', costBlockId: '101', amount: 100_000 }
      ],
      10
    )

    expect(rows).toEqual([
      {
        vendorId: '2',
        vendorName: 'Beta',
        utilityPercentage: 62,
        normalizedUtility: 0.62,
        totalCost: 4_000_000,
        normalizedCost: 1,
        balancedScore: 0.81,
        costFocusScore: 0.848,
        utilityFocusScore: 0.772,
        rank: 1,
        hasQuestions: true
      },
      {
        vendorId: '1',
        vendorName: 'Alpha',
        utilityPercentage: 79.2,
        normalizedUtility: 0.792,
        totalCost: 6_000_000,
        normalizedCost: 0.6667,
        balancedScore: 0.7293,
        costFocusScore: 0.7168,
        utilityFocusScore: 0.7419,
        rank: 2,
        hasQuestions: true
      },
      {
        vendorId: '3',
        vendorName: 'Gamma',
        utilityPercentage: 0,
        normalizedUtility: 0,
        totalCost: null,
        normalizedCost: null,
        balancedScore: null,
        costFocusScore: null,
        utilityFocusScore: null,
        rank: null,
        hasQuestions: false
      }
    ])
  })

  it('formats display values for the table', () => {
    expect(formatUtilityPercentage(78.3)).toBe('78%')
    expect(formatNormalizedCost(0.8879)).toBe('0,89')
    expect(formatValueScore(0.9275)).toBe('0,93')
    expect(formatValueScoreCost(10000000)).toBe('10.000.000 €')
    expect(formatValueScore(null)).toBe('Nicht berechenbar')
  })

  it('calculates weighted scenario scores and detects the highest value', () => {
    expect(calculateWeightedScore(0.78, 0.89, 0.5, 0.5)).toBe(0.835)
    expect(calculateWeightedScore(0.78, 0.89, 0.4, 0.6)).toBe(0.846)
    expect(calculateWeightedScore(0.78, 0.89, 0.6, 0.4)).toBe(0.824)
    expect(calculateWeightedScore(0.78, null, 0.5, 0.5)).toBeNull()

    const rows = [
      {
        vendorId: '1',
        vendorName: 'Alpha',
        utilityPercentage: 80,
        normalizedUtility: 0.8,
        totalCost: 100,
        normalizedCost: 1,
        balancedScore: 0.9,
        costFocusScore: 0.92,
        utilityFocusScore: 0.88,
        rank: 1,
        hasQuestions: true
      },
      {
        vendorId: '2',
        vendorName: 'Beta',
        utilityPercentage: 75,
        normalizedUtility: 0.75,
        totalCost: 110,
        normalizedCost: 0.9,
        balancedScore: 0.9,
        costFocusScore: 0.89,
        utilityFocusScore: 0.91,
        rank: 2,
        hasQuestions: true
      }
    ]

    expect(getHighestScoreValue(rows, 'balancedScore')).toBe(0.9)
    expect(getHighestScoreValue(rows, 'costFocusScore')).toBe(0.92)
    expect(getHighestScoreValue(rows, 'utilityFocusScore')).toBe(0.91)
  })
})
