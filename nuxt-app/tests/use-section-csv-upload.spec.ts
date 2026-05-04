import { ref, watch } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import {
  findDuplicateQuestionNumber,
  formatPercentageValue,
  normalizeQuestionSharesForSectionWeight,
  useSectionCsvUpload
} from '../app/composables/useSectionCsvUpload'

import type { CriteriaCsvQuestionRow } from '../app/types/criteria-csv'

vi.stubGlobal('ref', ref)
vi.stubGlobal('watch', watch)

function createQuestion(anteil: number): CriteriaCsvQuestionRow {
  return {
    nr: '1',
    frage: 'Frage',
    punkte: 10,
    kommentar: '',
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

  it('parses CSV rows with an optional kommentar column', async () => {
    const uploaded = vi.fn()
    const onError = vi.fn()
    const { handleCsvSelection } = useSectionCsvUpload({
      sectionWeight: 10,
      onUploaded: uploaded,
      onError
    })

    const file = new File(
      ['1;Frage A;10;Auswertung vorhanden;4\n2;Frage B;12;;6'],
      'fragen.csv',
      { type: 'text/csv' }
    )

    await handleCsvSelection(file)

    expect(uploaded).toHaveBeenCalledWith([
      { nr: '1', frage: 'Frage A', punkte: 10, kommentar: 'Auswertung vorhanden', anteil: 0.04 },
      { nr: '2', frage: 'Frage B', punkte: 12, kommentar: '', anteil: 0.06 }
    ])
    expect(onError).not.toHaveBeenCalled()
  })

  it('keeps legacy CSV rows without kommentar column compatible', async () => {
    const uploaded = vi.fn()
    const onError = vi.fn()
    const { handleCsvSelection } = useSectionCsvUpload({
      sectionWeight: 10,
      onUploaded: uploaded,
      onError
    })

    const file = new File(
      ['1;Frage A;10;4\n2;Frage B;12;6'],
      'fragen.csv',
      { type: 'text/csv' }
    )

    await handleCsvSelection(file)

    expect(uploaded).toHaveBeenCalledWith([
      { nr: '1', frage: 'Frage A', punkte: 10, kommentar: '', anteil: 0.04 },
      { nr: '2', frage: 'Frage B', punkte: 12, kommentar: '', anteil: 0.06 }
    ])
    expect(onError).not.toHaveBeenCalled()
  })

  it('ignores a trailing evaluation column from semicolon-separated exports', async () => {
    const uploaded = vi.fn()
    const onError = vi.fn()
    const { handleCsvSelection } = useSectionCsvUpload({
      sectionWeight: 3,
      onUploaded: uploaded,
      onError
    })

    const file = new File(
      ['\uFEFF7.2;Frage A;40;;0,4;1,00 %\n7.3;Frage B;20;Hinweis;0,6;2,00 %'],
      'fragen.csv',
      { type: 'text/csv' }
    )

    await handleCsvSelection(file)

    expect(uploaded).toHaveBeenCalledWith([
      { nr: '7.2', frage: 'Frage A', punkte: 40, kommentar: '', anteil: 0.01 },
      { nr: '7.3', frage: 'Frage B', punkte: 20, kommentar: 'Hinweis', anteil: 0.02 }
    ])
    expect(onError).not.toHaveBeenCalled()
  })

  it('ignores columns after the sixth and skips semicolon-only garbage rows', async () => {
    const uploaded = vi.fn()
    const onError = vi.fn()
    const { handleCsvSelection } = useSectionCsvUpload({
      sectionWeight: 3,
      onUploaded: uploaded,
      onError
    })

    const file = new File(
      ['1;Frage A;40;;0,40;1,00%;;;;;\n;;;;;;\n2;Frage B;20;Kommentar;0,60;2,00%;;;;'],
      'fragen.csv',
      { type: 'text/csv' }
    )

    await handleCsvSelection(file)

    expect(uploaded).toHaveBeenCalledWith([
      { nr: '1', frage: 'Frage A', punkte: 40, kommentar: '', anteil: 0.01 },
      { nr: '2', frage: 'Frage B', punkte: 20, kommentar: 'Kommentar', anteil: 0.02 }
    ])
    expect(onError).not.toHaveBeenCalled()
  })
})
