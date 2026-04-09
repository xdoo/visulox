<script setup lang="ts">
import AusschreibungSectionCsvUpload from './AusschreibungSectionCsvUpload.vue'

import type { AusschreibungSection } from '../../shared/types/ausschreibungen'
import type { CriteriaCsvQuestionRow } from '../types/criteria-csv'

const props = defineProps<{
  section: AusschreibungSection
}>()

const isUploadModalOpen = ref(false)
const questions = ref<CriteriaCsvQuestionRow[]>([])
const csvError = ref('')

function formatPercentage(value: number) {
  const percentage = value * 100

  if (Number.isInteger(percentage)) {
    return `${percentage}%`
  }

  return `${percentage.toFixed(2).replace(/\.?0+$/, '')}%`
}

function handleCsvUploaded(parsedQuestions: CriteriaCsvQuestionRow[]) {
  csvError.value = ''
  questions.value = parsedQuestions
  isUploadModalOpen.value = false
}

function handleCsvError(message: string) {
  csvError.value = message
}

watch(isUploadModalOpen, (open) => {
  if (open) {
    csvError.value = ''
  }
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="font-semibold">{{ props.section.name }}</h3>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            icon="i-heroicons-cloud-arrow-up"
            color="neutral"
            variant="outline"
            aria-label="CSV fuer Abschnitt hochladen"
            @click="isUploadModalOpen = true"
          />

          <UBadge color="neutral" variant="subtle" size="lg">
            {{ props.section.weight }}%
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div
        v-if="questions.length > 0"
        class="space-y-2"
      >
        <div class="overflow-hidden rounded-lg border ui-border">
          <div class="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 text-sm font-medium dark:bg-gray-950">
            <div class="col-span-1">Nr</div>
            <div class="col-span-7">Frage</div>
            <div class="col-span-2">Punkte</div>
            <div class="col-span-2">Anteil</div>
          </div>

          <div class="divide-y ui-border">
            <div
              v-for="question in questions"
              :key="`${props.section.id}-${question.nr}-${question.frage}`"
              class="grid grid-cols-12 gap-4 px-4 py-3 text-sm"
            >
              <div class="col-span-1">{{ question.nr }}</div>
              <div class="col-span-7">{{ question.frage }}</div>
              <div class="col-span-2">{{ question.punkte }}</div>
              <div class="col-span-2">{{ formatPercentage(question.anteil) }}</div>
            </div>
          </div>
        </div>
      </div>

      <p v-if="csvError" class="text-sm text-error">
        {{ csvError }}
      </p>
    </div>

    <AusschreibungSectionCsvUpload
      v-model:open="isUploadModalOpen"
      :section-name="props.section.name"
      :section-weight="props.section.weight"
      @uploaded="handleCsvUploaded"
      @error="handleCsvError"
    />
  </UCard>
</template>
