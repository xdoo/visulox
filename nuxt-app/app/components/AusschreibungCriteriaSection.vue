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
          <p class="mt-1 text-sm ui-text-muted">
            Abschnitt des Kriterienkatalogs
          </p>
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
      <p class="text-sm ui-text-muted">
        Weitere fachliche Logik fuer diesen Abschnitt wird hier aufgebaut.
      </p>

      <div
        v-if="questions.length > 0"
        class="space-y-2"
      >
        <p class="text-sm font-medium">Importierte Fragen</p>

        <div class="overflow-x-auto rounded-lg border ui-border">
          <table class="min-w-full divide-y ui-border text-sm">
            <thead class="bg-gray-50 dark:bg-gray-950">
              <tr>
                <th class="px-4 py-3 text-left font-medium">Nr</th>
                <th class="px-4 py-3 text-left font-medium">Frage</th>
                <th class="px-4 py-3 text-left font-medium">Punkte</th>
                <th class="px-4 py-3 text-left font-medium">Anteil</th>
              </tr>
            </thead>
            <tbody class="divide-y ui-border">
              <tr v-for="question in questions" :key="`${props.section.id}-${question.nr}-${question.frage}`">
                <td class="px-4 py-3 align-top">{{ question.nr }}</td>
                <td class="px-4 py-3">{{ question.frage }}</td>
                <td class="px-4 py-3 align-top">{{ question.punkte }}</td>
                <td class="px-4 py-3 align-top">{{ question.anteil }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p v-if="csvError" class="text-sm text-error">
        {{ csvError }}
      </p>
    </div>

    <AusschreibungSectionCsvUpload
      v-model:open="isUploadModalOpen"
      :section-name="props.section.name"
      @uploaded="handleCsvUploaded"
      @error="handleCsvError"
    />
  </UCard>
</template>
