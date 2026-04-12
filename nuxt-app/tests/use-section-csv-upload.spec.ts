import { describe, expect, it } from 'vitest'

import {
  findDuplicateQuestionNumber,
  formatPercentageValue,
  normalizeQuestionSharesForSectionWeight
} from '../app/composables/useSectionCsvUpload'

import type { CriteriaCsvQuestionRow } from '../app/types/criteria-csv'

function createQuestion(anteil: number): CriteriaCsvQuestionRow {
  return {
    nr: '1',
    frage: 'Frage',
    punkte: 10,
    anteil
  }
}

describe('useSectionCsvUpload helpers', () => {
  it('keeps fraction-based shares unchanged when they already match the section weight', () => {
    const questions = [createQuestion(0.021), createQuestion(0.079)]

    expect(normalizeQuestionSharesForSectionWeight(questions, 10)).toEqual(questions)
  })

  it('normalizes percentage-point shares to fractions', () => {
    const questions = [createQuestion(2.1), createQuestion(7.9)]

    expect(normalizeQuestionSharesForSectionWeight(questions, 10)).toEqual([
      createQuestion(0.021),
      createQuestion(0.079)
    ])
  })

  it('returns null when the shares do not match the section weight in either format', () => {
    const questions = [createQuestion(1), createQuestion(2)]

    expect(normalizeQuestionSharesForSectionWeight(questions, 10)).toBeNull()
  })

  it('detects duplicate question numbers', () => {
    expect(findDuplicateQuestionNumber([
      { ...createQuestion(0.1), nr: '1.1' },
      { ...createQuestion(0.2), nr: '1.2' },
      { ...createQuestion(0.3), nr: '1.1' }
    ])).toBe('1.1')
  })

  it('formats percentage values without trailing zeros', () => {
    expect(formatPercentageValue(1000)).toBe('1000')
    expect(formatPercentageValue(10.5)).toBe('10.5')
    expect(formatPercentageValue(10.25)).toBe('10.25')
  })
})
