<script setup lang="ts">
import Papa from 'papaparse'

import type { ParseError } from 'papaparse'
import type { CriteriaCsvQuestionRow } from '../types/criteria-csv'

const props = defineProps<{
  sectionName: string
  sectionWeight: number
}>()

const emit = defineEmits<{
  uploaded: [questions: CriteriaCsvQuestionRow[]]
  error: [message: string]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const csvFile = ref<File | null>(null)
const csvError = ref('')

function parseNumber(value: string) {
  const normalizedValue = value.trim().replace(',', '.')
  const parsedValue = Number(normalizedValue)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function buildParseErrorMessage(errors: ParseError[]) {
  if (errors.length === 0) {
    return 'Die CSV-Datei konnte nicht interpretiert werden.'
  }

  const firstError = errors[0]
  return `CSV-Parsing fehlgeschlagen: ${firstError.message}`
}

function validateRequiredValue(value: string, label: string, rowIndex: number) {
  if (!value) {
    throw new Error(`CSV-Zeile ${rowIndex + 1}: ${label} ist ein Pflichtfeld.`)
  }
}

function parseCsvQuestions(csvContent: string) {
  const result = Papa.parse<string[]>(csvContent, {
    header: false,
    skipEmptyLines: true
  })

  if (result.errors.length > 0) {
    throw new Error(buildParseErrorMessage(result.errors))
  }

  return result.data.map((row, index) => {
    if (row.length !== 4) {
      throw new Error(`CSV-Zeile ${index + 1} muss genau 4 Spalten enthalten.`)
    }

    const [nr, frage, punkteRaw, anteilRaw] = row.map(value => value.trim())
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

  if (Math.abs(totalPercentage - props.sectionWeight) > 0.0001) {
    throw new Error(
      `Die Summe der Spalte Anteil ergibt ${totalPercentage.toFixed(2).replace(/\.?0+$/, '')}% und entspricht nicht dem Abschnittsgewicht von ${props.sectionWeight}%.`
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
    emit('error', csvError.value)
    return
  }

  try {
    const csvContent = await file.text()
    const questions = parseCsvQuestions(csvContent)
    validateQuestionsAgainstSectionWeight(questions)
    emit('uploaded', questions)
  } catch (error) {
    csvError.value = error instanceof Error ? error.message : 'Die CSV-Datei konnte nicht gelesen werden.'
    emit('error', csvError.value)
  }
}

watch(csvFile, async (file) => {
  await handleCsvSelection(file)
})

watch(isOpen, (open) => {
  if (open) {
    csvFile.value = null
    csvError.value = ''
  }
})
</script>

<template>
  <UModal v-model:open="isOpen" title="CSV hochladen" :ui="{ width: 'sm:max-w-2xl' }">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm ui-text-muted">
          Laden Sie eine CSV-Datei fuer den Abschnitt {{ props.sectionName }} hoch.
        </p>

        <UFileUpload
          v-model="csvFile"
          accept=".csv,text/csv"
          label="CSV-Datei auswaehlen"
          description="Es ist nur eine einzelne CSV-Datei erlaubt."
          class="w-full"
        />

        <p v-if="csvError" class="text-sm text-error">
          {{ csvError }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end">
        <UButton color="neutral" variant="ghost" @click="isOpen = false">
          Schliessen
        </UButton>
      </div>
    </template>
  </UModal>
</template>
