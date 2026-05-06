import Papa from 'papaparse'

import type { Ref } from 'vue'
import type { ParseError } from 'papaparse'
import type { CriteriaCsvQuestionRow } from '../types/criteria-csv'

interface UseSectionCsvUploadOptions {
  sectionWeight: number
  onUploaded: (questions: CriteriaCsvQuestionRow[]) => void
  onError: (message: string) => void
}

type CsvQuestionRowTuple = [string, string, string, string, string]
const SECTION_WEIGHT_PERCENT_TOLERANCE = 0.05
const ACCEPTED_CSV_DELIMITERS = ['', ';', ','] as const

function normalizeCellValue(value: string | undefined) {
  return value?.replace(/^\uFEFF/, '').trim() || ''
}

export function formatPercentageValue(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function roundToTwoDecimals(value: number) {
  return Number(value.toFixed(2))
}

export function normalizeQuestionSharesForSectionWeight(
  questions: CriteriaCsvQuestionRow[],
  sectionWeight: number
) {
  const totalAnteil = questions.reduce((sum, question) => sum + question.anteil, 0)
  const totalPercentageFromFraction = roundToTwoDecimals(totalAnteil * 100)
  const normalizedSectionWeight = roundToTwoDecimals(sectionWeight)

  if (Math.abs(totalPercentageFromFraction - normalizedSectionWeight) <= SECTION_WEIGHT_PERCENT_TOLERANCE) {
    return questions
  }

  if (Math.abs(roundToTwoDecimals(totalAnteil) - normalizedSectionWeight) <= SECTION_WEIGHT_PERCENT_TOLERANCE) {
    return questions.map(question => ({
      ...question,
      anteil: question.anteil / 100
    }))
  }

  return null
}

export function findDuplicateQuestionNumber(questions: Pick<CriteriaCsvQuestionRow, 'nr'>[]) {
  const seenNumbers = new Set<string>()

  for (const question of questions) {
    const normalizedNumber = question.nr.trim()

    if (seenNumbers.has(normalizedNumber)) {
      return normalizedNumber
    }

    seenNumbers.add(normalizedNumber)
  }

  return null
}

export function useSectionCsvUpload(options: UseSectionCsvUploadOptions) {
  const csvFile = ref<File | null>(null)
  const csvError = ref('')

  function reset() {
    csvFile.value = null
    csvError.value = ''
  }

  function parseNumber(value: string) {
    const normalizedValue = normalizeCellValue(value)
      .replace(/\s|%/g, '')
      .replace(',', '.')
    const parsedValue = Number(normalizedValue)

    return Number.isFinite(parsedValue) ? parsedValue : null
  }

  function buildParseErrorMessage(errors: ParseError[]) {
    const firstError = errors[0]

    if (!firstError) {
      return 'Die CSV-Datei konnte nicht interpretiert werden.'
    }

    return `CSV-Parsing fehlgeschlagen: ${firstError.message}`
  }

  function validateRequiredValue(value: string, label: string, rowIndex: number) {
    if (!value) {
      throw new Error(`CSV-Zeile ${rowIndex + 1}: ${label} ist ein Pflichtfeld.`)
    }
  }

  function normalizeCsvRow(row: string[], index: number): CsvQuestionRowTuple {
    if (row.length !== 4 && row.length !== 5 && row.length !== 6) {
      throw new Error(`CSV-Zeile ${index + 1} muss 4, 5 oder 6 Spalten enthalten.`)
    }

    if (row.length === 4) {
      return [
        normalizeCellValue(row[0]),
        normalizeCellValue(row[1]),
        normalizeCellValue(row[2]),
        '',
        normalizeCellValue(row[3])
      ]
    }

    if (row.length === 6) {
      return [
        normalizeCellValue(row[0]),
        normalizeCellValue(row[1]),
        normalizeCellValue(row[2]),
        normalizeCellValue(row[3]),
        normalizeCellValue(row[5])
      ]
    }

    return [
      normalizeCellValue(row[0]),
      normalizeCellValue(row[1]),
      normalizeCellValue(row[2]),
      normalizeCellValue(row[3]),
      normalizeCellValue(row[4])
    ]
  }

  function parseCsvContent(csvContent: string, delimiter: typeof ACCEPTED_CSV_DELIMITERS[number]) {
    return Papa.parse<string[]>(csvContent, {
      delimiter,
      header: false,
      skipEmptyLines: 'greedy'
    })
  }

  function getPreparedRows(rows: string[][]) {
    return rows
      .map((row, originalIndex) => ({
        row: row.slice(0, 6),
        originalIndex
      }))
      .filter(({ row }) => row.some((value) => normalizeCellValue(value) !== ''))
  }

  function hasValidCsvShape(rows: string[][]) {
    const preparedRows = getPreparedRows(rows)

    return preparedRows.length > 0 && preparedRows.every(({ row }) => (
      row.length === 4 || row.length === 5 || row.length === 6
    ))
  }

  function parseCsvWithAcceptedDelimiter(csvContent: string) {
    const results = ACCEPTED_CSV_DELIMITERS.map((delimiter) => parseCsvContent(csvContent, delimiter))
    const validResult = results.find((result) => result.errors.length === 0 && hasValidCsvShape(result.data))

    if (validResult) {
      return validResult
    }

    const leastBrokenResult = results.find((result) => result.errors.length === 0) || results[0]

    if (!leastBrokenResult) {
      throw new Error('Die CSV-Datei konnte nicht interpretiert werden.')
    }

    return leastBrokenResult
  }

  function parseCsvQuestions(csvContent: string): CriteriaCsvQuestionRow[] {
    const result = parseCsvWithAcceptedDelimiter(csvContent)

    if (result.errors.length > 0) {
      throw new Error(buildParseErrorMessage(result.errors))
    }

    const preparedRows = getPreparedRows(result.data)

    return preparedRows.map(({ row, originalIndex }) => {
      const [nr, frage, punkteRaw, kommentar, anteilRaw] = normalizeCsvRow(row, originalIndex)
      validateRequiredValue(nr, 'Nr', originalIndex)
      validateRequiredValue(frage, 'Frage', originalIndex)
      validateRequiredValue(punkteRaw, 'Punkte', originalIndex)
      validateRequiredValue(anteilRaw, 'Anteil', originalIndex)

      const punkte = parseNumber(punkteRaw)
      const anteil = parseNumber(anteilRaw)

      if (punkte === null) {
        throw new Error(`CSV-Zeile ${originalIndex + 1} hat keinen gueltigen Punkte-Wert.`)
      }

      if (anteil === null) {
        throw new Error(`CSV-Zeile ${originalIndex + 1} hat keinen gueltigen Anteil-Wert.`)
      }

      return {
        nr,
        frage,
        punkte,
        kommentar,
        anteil
      }
    })
  }

  function validateQuestionsAgainstSectionWeight(questions: CriteriaCsvQuestionRow[]) {
    const duplicateNumber = findDuplicateQuestionNumber(questions)

    if (duplicateNumber) {
      throw new Error(`Die Fragennummer "${duplicateNumber}" kommt in der CSV mehrfach vor.`)
    }

    const normalizedQuestions = normalizeQuestionSharesForSectionWeight(questions, options.sectionWeight)

    if (!normalizedQuestions) {
      const totalAnteil = questions.reduce((sum, question) => sum + question.anteil, 0)
      const totalPercentage = roundToTwoDecimals(totalAnteil * 100)
      const expectedPercentage = roundToTwoDecimals(options.sectionWeight)
      const difference = roundToTwoDecimals(totalPercentage - expectedPercentage)

      throw new Error(
        `Die Summe der Spalte Anteil ergibt ${formatPercentageValue(totalPercentage)}%. Erwartet sind ${formatPercentageValue(expectedPercentage)}% (Abweichung ${formatPercentageValue(difference)}%).`
      )
    }

    return normalizedQuestions
  }

  async function handleCsvSelection(file: File | null | undefined) {
    csvError.value = ''

    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      csvFile.value = null
      csvError.value = 'Bitte laden Sie eine CSV-Datei hoch.'
      options.onError(csvError.value)
      return
    }

    try {
      const csvContent = await file.text()
      const questions = parseCsvQuestions(csvContent)
      const normalizedQuestions = validateQuestionsAgainstSectionWeight(questions)
      options.onUploaded(normalizedQuestions)
    } catch (error) {
      csvError.value = error instanceof Error ? error.message : 'Die CSV-Datei konnte nicht gelesen werden.'
      options.onError(csvError.value)
    }
  }

  function bindFileWatcher(source: Ref<File | null>) {
    return watch(source, async (file) => {
      await handleCsvSelection(file)
    })
  }

  return {
    csvFile,
    csvError,
    reset,
    handleCsvSelection,
    bindFileWatcher
  }
}
