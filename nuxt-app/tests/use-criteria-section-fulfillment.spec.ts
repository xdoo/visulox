import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import {
  calculateScoreRangeSpan,
  calculateSectionContributionPercentage,
  calculateSectionFulfillmentPercentage,
  formatSectionFulfillmentPercentage,
  getSectionFulfillmentBadgeColor,
  useCriteriaSectionFulfillment
} from '../app/composables/useCriteriaSectionFulfillment'

import type { SectionQuestion } from '../shared/types/tenders'

function createQuestion(overrides: Partial<SectionQuestion>): SectionQuestion {
  return {
    id: '1',
    nr: '1',
    frage: 'Frage',
    punkte: 0,
    anteil: 0,
    gewichtetePunkte: 0,
    ...overrides
  }
}

describe('useCriteriaSectionFulfillment', () => {
  it('returns the score span only for valid score ranges', () => {
    expect(calculateScoreRangeSpan([0, 10])).toBe(10)
    expect(calculateScoreRangeSpan([1, 5])).toBe(4)
    expect(calculateScoreRangeSpan([5, 5])).toBeNull()
  })

  it('returns null without questions', () => {
    expect(calculateSectionFulfillmentPercentage([], 30, [0, 10])).toBeNull()
  })

  it('calculates the fulfillment on a 0-100 scale for a zero-based score range', () => {
    const questions = [
      createQuestion({ punkte: 10, anteil: 0.15, gewichtetePunkte: 1.5 }),
      createQuestion({ id: '2', punkte: 10, anteil: 0.15, gewichtetePunkte: 1.5 })
    ]

    expect(calculateSectionFulfillmentPercentage(questions, 30, [0, 10])).toBe(100)
  })

  it('respects the lower bound of the score range', () => {
    const questions = [
      createQuestion({ punkte: 3, anteil: 0.15, gewichtetePunkte: 0.45 }),
      createQuestion({ id: '2', punkte: 3, anteil: 0.15, gewichtetePunkte: 0.45 })
    ]

    // score range [1, 4] => normalized score 2 of 3 => 66.6667%
    expect(calculateSectionFulfillmentPercentage(questions, 30, [1, 4])).toBeCloseTo(66.6667, 3)
    expect(formatSectionFulfillmentPercentage(66.6667)).toBe('67%')
  })

  it('clamps fulfillment to 100 percent', () => {
    const questions = [createQuestion({ punkte: 12, anteil: 0.3, gewichtetePunkte: 3.6 })]

    expect(calculateSectionFulfillmentPercentage(questions, 30, [0, 10])).toBe(100)
  })

  it('calculates the weighted contribution from the fulfillment', () => {
    const questions = [
      createQuestion({ punkte: 3, anteil: 0.15, gewichtetePunkte: 0.45 }),
      createQuestion({ id: '2', punkte: 3, anteil: 0.15, gewichtetePunkte: 0.45 })
    ]

    expect(calculateSectionContributionPercentage(questions, 30, [1, 4])).toBeCloseTo(20, 3)
  })

  it('maps fulfillment ranges to badge colors', () => {
    expect(getSectionFulfillmentBadgeColor(20)).toBe('error')
    expect(getSectionFulfillmentBadgeColor(50)).toBe('warning')
    expect(getSectionFulfillmentBadgeColor(80)).toBe('success')
  })

  it('exposes computed label and color', () => {
    const questions = ref([
      createQuestion({ punkte: 2, anteil: 0.15, gewichtetePunkte: 0.3 }),
      createQuestion({ id: '2', punkte: 2, anteil: 0.15, gewichtetePunkte: 0.3 })
    ])
    const sectionWeight = ref(30)
    const scoreRange = ref<[number, number]>([1, 4])

    const { fulfillmentPercentage, contributionPercentage, fulfillmentLabel, fulfillmentBadgeColor } = useCriteriaSectionFulfillment(
      computed(() => questions.value),
      computed(() => sectionWeight.value),
      computed(() => scoreRange.value)
    )

    expect(fulfillmentPercentage.value).toBeCloseTo(33.3333, 3)
    expect(contributionPercentage.value).toBeCloseTo(10, 3)
    expect(fulfillmentLabel.value).toBe('33%')
    expect(fulfillmentBadgeColor.value).toBe('error')
  })
})
