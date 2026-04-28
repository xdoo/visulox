import { describe, expect, it } from 'vitest'

import {
  buildCategoryQuestionsJsonPayload,
  getCategoryQuestionsJsonFilename
} from '../app/composables/useCategoryQuestionsJsonExport'

import type { TenderSection, TenderVendor } from '../shared/types/tenders'

describe('useCategoryQuestionsJsonExport', () => {
  const vendors: TenderVendor[] = [
    { id: '1', name: 'Alpha' },
    { id: '2', name: 'Beta' }
  ]

  const section: TenderSection = {
    id: '10',
    name: 'Funktional',
    weight: 40,
    evaluators: '',
    description: '',
    questionsByVendor: [
      {
        vendorId: '1',
        questions: [
          {
            id: 'q1',
            nr: '1.1',
            frage: 'Unterstuetzt die Loesung Prozess A?',
            punkte: 8,
            kommentar: 'Erfuellt mit kleineren Einschraenkungen.',
            anteil: 0.16,
            gewichtetePunkte: 1.28
          },
          {
            id: 'q2',
            nr: '1.2',
            frage: 'Unterstuetzt die Loesung Prozess B?',
            punkte: 6,
            kommentar: '',
            anteil: 0.24,
            gewichtetePunkte: 1.44
          }
        ]
      },
      {
        vendorId: '2',
        questions: [
          {
            id: 'q3',
            nr: '1.1',
            frage: 'Unterstuetzt die Loesung Prozess A?',
            punkte: 9,
            kommentar: 'Sehr gute Abdeckung.',
            anteil: 0.16,
            gewichtetePunkte: 1.44
          }
        ]
      }
    ]
  }

  it('builds a category questions payload in stable vendor order', () => {
    expect(buildCategoryQuestionsJsonPayload(section, vendors)).toEqual({
      kategorie: {
        id: '10',
        name: 'Funktional',
        gewicht: 40
      },
      anbieter: [
        {
          id: '1',
          name: 'Alpha',
          fragen: [
            {
              id: 'q1',
              nr: '1.1',
              frage: 'Unterstuetzt die Loesung Prozess A?',
              gewichtungInnerhalbKategorie: 0.4,
              anteil: 0.16,
              punkte: 8,
              kommentar: 'Erfuellt mit kleineren Einschraenkungen.'
            },
            {
              id: 'q2',
              nr: '1.2',
              frage: 'Unterstuetzt die Loesung Prozess B?',
              gewichtungInnerhalbKategorie: 0.6,
              anteil: 0.24,
              punkte: 6,
              kommentar: ''
            }
          ]
        },
        {
          id: '2',
          name: 'Beta',
          fragen: [
            {
              id: 'q3',
              nr: '1.1',
              frage: 'Unterstuetzt die Loesung Prozess A?',
              gewichtungInnerhalbKategorie: 0.4,
              anteil: 0.16,
              punkte: 9,
              kommentar: 'Sehr gute Abdeckung.'
            }
          ]
        }
      ]
    })
  })

  it('builds a stable json filename from the category name', () => {
    expect(getCategoryQuestionsJsonFilename(section)).toBe('kategorie-funktional-fragen.json')
    expect(getCategoryQuestionsJsonFilename({ id: '11', name: '   ' })).toBe('kategorie-11-fragen.json')
  })
})
