import Papa from 'papaparse'

import type { Ref } from 'vue'
import type { ParseError } from 'papaparse'
import type { CriteriaCsvQuestionRow } from '../types/criteria-csv'

interface UseSectionCsvUploadOptions {
  sectionWeight: number
  onUploaded: (questions: CriteriaCsvQuestionRow[]) => void
  onError: (message: string) => void
}

type CsvQuestionRowTuple = [string, string, string, string]

export function useSectionCsvUpload(options: UseSectionCsvUploadOptions) {
  const csvFile = ref<File | null>(null)
  const csvError = ref('')

  function reset() {
    csvFile.value = null
    csvError.value = ''
  }

  function parseNumber(value: string) {
    const normalizedValue = value.trim().replace(',', '.')
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
    if (row.length !== 4) {
      throw new Error(`CSV-Zeile ${index + 1} muss genau 4 Spalten enthalten.`)
    }

    return [
      row[0]?.trim() || '',
      row[1]?.trim() || '',
      row[2]?.trim() || '',
      row[3]?.trim() || ''
    ]
  }

  function parseCsvQuestions(csvContent: string): CriteriaCsvQuestionRow[] {
    const result = Papa.parse<string[]>(csvContent, {
      header: false,
      skipEmptyLines: true
    })

    if (result.errors.length > 0) {
      throw new Error(buildParseErrorMessage(result.errors))
    }

    return result.data.map((row, index) => {
      const [nr, frage, punkteRaw, anteilRaw] = normalizeCsvRow(row, index)
      validateRequiredValue(nr, 'Nr', index)
      validateRequiredValue(frage, 'Frage', index)
      validateRequiredValue(punkteRaw, 'Punkte', index)
      validateRequiredValue(anteilRaw, 'Anteil', index)

      const punkte = parseNumber(punkteRaw)
      const anteil = parseNumber(anteilRaw)

      if (punkte === null) {
        throw new Error(`CSV-Zeile ${index + 1} hat keinen gueltigen Punkte-Wert.`)
      }

      if (anteil === null) {
        throw new Error(`CSV-Zeile ${index + 1} hat keinen gueltigen Anteil-Wert.`)
      }

      return {
        nr,
        frage,
        punkte,
        anteil
      }
    })
  }

  function validateQuestionsAgainstSectionWeight(questions: CriteriaCsvQuestionRow[]) {
    const totalAnteil = questions.reduce((sum, question) => sum + question.anteil, 0)
    const totalPercentage = totalAnteil * 100

    if (Math.abs(totalPercentage - options.sectionWeight) > 0.0001) {
      throw new Error(
        `Die Summe der Spalte Anteil ergibt ${totalPercentage.toFixed(2).replace(/\.?0+$/, '')}% und entspricht nicht dem Abschnittsgewicht von ${options.sectionWeight}%.`
      )
    }
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
      validateQuestionsAgainstSectionWeight(questions)
      options.onUploaded(questions)
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
