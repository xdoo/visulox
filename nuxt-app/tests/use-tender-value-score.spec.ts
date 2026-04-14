import { describe, expect, it } from 'vitest'

import {
  buildTenderValueScoreRows,
  formatCostFactor,
  formatUtilityPercentage,
  formatValueScore,
  formatValueScoreCost
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
        costFactor: 1.5,
        valueScore: 0.93,
        rank: 1,
        hasQuestions: true
      },
      {
        vendorId: '1',
        vendorName: 'Alpha',
        utilityPercentage: 79.2,
        normalizedUtility: 0.792,
        totalCost: 6_000_000,
        costFactor: 1,
        valueScore: 0.792,
        rank: 2,
        hasQuestions: true
      },
      {
        vendorId: '3',
        vendorName: 'Gamma',
        utilityPercentage: 0,
        normalizedUtility: 0,
        totalCost: null,
        costFactor: null,
        valueScore: null,
        rank: null,
        hasQuestions: false
      }
    ])
  })

  it('formats display values for the table', () => {
    expect(formatUtilityPercentage(78.3)).toBe('78%')
    expect(formatCostFactor(1.654)).toBe('1,65')
    expect(formatValueScore(0.9275)).toBe('0,93')
    expect(formatValueScoreCost(10000000)).toBe('10.000.000 €')
    expect(formatValueScore(null)).toBe('Nicht berechenbar')
  })
})
