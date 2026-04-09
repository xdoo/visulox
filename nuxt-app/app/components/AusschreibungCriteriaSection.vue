<script setup lang="ts">
import AusschreibungSectionCsvUpload from './AusschreibungSectionCsvUpload.vue'

import type { AusschreibungSection } from '../../shared/types/ausschreibungen'
import type { CriteriaCsvQuestionRow } from '../types/criteria-csv'

const props = defineProps<{
  section: AusschreibungSection
}>()

const isUploadModalOpen = ref(false)
const csvError = ref('')
const { isSaving, errorMessage, saveAbschnittFragen } = useSaveAbschnittFragen()
const { formatPercentage, formatWeightedPoints } = useCriteriaQuestionFormatting()

async function handleCsvUploaded(parsedQuestions: CriteriaCsvQuestionRow[]) {
  csvError.value = ''

  try {
    await saveAbschnittFragen(props.section.id, parsedQuestions)
    await refreshNuxtData(`ausschreibung-detail:${useRoute().params.id}`)
    isUploadModalOpen.value = false
  } catch {
    csvError.value = errorMessage.value || 'Fragen konnten nicht gespeichert werden.'
  }
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
        v-if="props.section.questions.length > 0"
        class="space-y-2"
      >
        <div class="overflow-hidden rounded-lg border ui-border">
          <div class="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 text-sm font-medium dark:bg-gray-950">
            <div class="col-span-1">Nr</div>
            <div class="col-span-8">Frage</div>
            <div class="col-span-1 text-right">Punkte</div>
            <div class="col-span-1 text-right">Anteil</div>
            <div class="col-span-1 text-right">gew. Punkte</div>
          </div>

          <div class="divide-y ui-border">
            <div
              v-for="question in props.section.questions"
              :key="`${props.section.id}-${question.nr}-${question.frage}`"
              class="grid grid-cols-12 gap-4 px-4 py-3 text-sm"
            >
              <div class="col-span-1">{{ question.nr }}</div>
              <div class="col-span-8">{{ question.frage }}</div>
              <div class="col-span-1 text-right">{{ question.punkte }}</div>
              <div class="col-span-1 text-right">{{ formatPercentage(question.anteil) }}</div>
              <div class="col-span-1 text-right">{{ formatWeightedPoints(question.punkte, question.anteil) }}</div>
            </div>
          </div>
        </div>
      </div>

      <p v-if="csvError" class="text-sm text-error">
        {{ csvError }}
      </p>

      <p v-if="isSaving" class="text-sm ui-text-muted">
        Fragen werden gespeichert ...
      </p>
    </div>

    <AusschreibungSectionCsvUpload
      v-model:open="isUploadModalOpen"
      :section-name="props.section.name"
      :section-weight="props.section.weight"
      :error-message="csvError"
      @uploaded="handleCsvUploaded"
      @error="handleCsvError"
    />
  </UCard>
</template>
