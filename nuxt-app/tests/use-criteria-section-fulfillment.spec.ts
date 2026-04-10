import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import {
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
  it('returns null without questions', () => {
    expect(calculateSectionFulfillmentPercentage([], 30, 100)).toBeNull()
  })

  it('calculates the fulfillment on a 0-100 scale', () => {
    const questions = [
      createQuestion({ gewichtetePunkte: 10 }),
      createQuestion({ id: '2', gewichtetePunkte: 10 })
    ]

    // (20 / 30) * 100 = 66.6667
    expect(calculateSectionFulfillmentPercentage(questions, 30, 100)).toBeCloseTo(66.6667, 3)
    expect(formatSectionFulfillmentPercentage(66.6667)).toBe('67%')
  })

  it('clamps fulfillment to 100 percent', () => {
    const questions = [createQuestion({ gewichtetePunkte: 40 })]

    expect(calculateSectionFulfillmentPercentage(questions, 30, 100)).toBe(100)
  })

  it('maps fulfillment ranges to badge colors', () => {
    expect(getSectionFulfillmentBadgeColor(20)).toBe('error')
    expect(getSectionFulfillmentBadgeColor(50)).toBe('warning')
    expect(getSectionFulfillmentBadgeColor(80)).toBe('success')
  })

  it('exposes computed label and color', () => {
    const questions = ref([
      createQuestion({ gewichtetePunkte: 5 }),
      createQuestion({ id: '2', gewichtetePunkte: 5 })
    ])
    const sectionWeight = ref(30)
    const maxPoints = ref(100)

    const { fulfillmentPercentage, fulfillmentLabel, fulfillmentBadgeColor } = useCriteriaSectionFulfillment(
      computed(() => questions.value),
      computed(() => sectionWeight.value),
      computed(() => maxPoints.value)
    )

    expect(fulfillmentPercentage.value).toBeCloseTo(33.3333, 3)
    expect(fulfillmentLabel.value).toBe('33%')
    expect(fulfillmentBadgeColor.value).toBe('error')
  })
})
