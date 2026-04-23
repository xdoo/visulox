import { describe, expect, it } from 'vitest'

import { buildSectionVendorComparisonRows } from '../app/composables/useTenderCategoryComparison'

describe('useTenderCategoryComparison', () => {
  it('builds section comparison rows in stable vendor order and highlights the best vendor', () => {
    const rows = buildSectionVendorComparisonRows(
      [
        { id: '1', name: 'Alpha' },
        { id: '2', name: 'Beta' },
        { id: '3', name: 'Gamma' }
      ],
      [
        {
          id: '10',
          name: 'Funktional',
          weight: 30,
          questionsByVendor: [
            {
              vendorId: '1',
              questions: [
                { id: 'q1', nr: '1', frage: 'A', punkte: 10, kommentar: '', anteil: 0.3, gewichtetePunkte: 0 }
              ]
            },
            {
              vendorId: '2',
              questions: [
                { id: 'q2', nr: '1', frage: 'A', punkte: 6, kommentar: '', anteil: 0.3, gewichtetePunkte: 0 }
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
          weight: 20,
          questionsByVendor: [
            {
              vendorId: '1',
              questions: [
                { id: 'q3', nr: '1', frage: 'B', punkte: 8, kommentar: '', anteil: 0.2, gewichtetePunkte: 0 }
              ]
            },
            {
              vendorId: '2',
              questions: [
                { id: 'q4', nr: '1', frage: 'B', punkte: 8, kommentar: '', anteil: 0.2, gewichtetePunkte: 0 }
              ]
            },
            {
              vendorId: '3',
              questions: []
            }
          ]
        }
      ],
      [0, 10]
    )

    expect(rows).toEqual([
      {
        sectionId: '10',
        sectionName: 'Funktional',
        sectionWeight: 30,
        vendors: [
          {
            vendorId: '1',
            vendorName: 'Alpha',
            fulfillment: 100,
            isBest: true,
            hasQuestions: true
          },
          {
            vendorId: '2',
            vendorName: 'Beta',
            fulfillment: 60,
            isBest: false,
            hasQuestions: true
          },
          {
            vendorId: '3',
            vendorName: 'Gamma',
            fulfillment: 0,
            isBest: false,
            hasQuestions: false
          }
        ]
      },
      {
        sectionId: '11',
        sectionName: 'Betrieb',
        sectionWeight: 20,
        vendors: [
          {
            vendorId: '1',
            vendorName: 'Alpha',
            fulfillment: 80,
            isBest: true,
            hasQuestions: true
          },
          {
            vendorId: '2',
            vendorName: 'Beta',
            fulfillment: 80,
            isBest: true,
            hasQuestions: true
          },
          {
            vendorId: '3',
            vendorName: 'Gamma',
            fulfillment: 0,
            isBest: false,
            hasQuestions: false
          }
        ]
      }
    ])
  })
})
