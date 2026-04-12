<script setup lang="ts">
import type { TenderSection, TenderSettings } from '../../../shared/types/tenders'

const props = defineProps<{
  section: TenderSection
  vendorId: string
  scoreRange: TenderSettings['scoreRange']
}>()

const vendorQuestions = computed(() => {
  return props.section.questionsByVendor.find((entry) => entry.vendorId === props.vendorId)?.questions || []
})

const {
  csvError,
  isDeleteModalOpen,
  isSaving,
  isDeleting,
  handleCsvUploaded,
  handleCsvError,
  handleDeleteQuestions
} = useCriteriaSectionActions({
  sectionId: props.section.id,
  vendorId: props.vendorId
})
const { formatPercentage, formatWeightedPoints } = useCriteriaQuestionFormatting()
const { fulfillmentLabel, fulfillmentBadgeColor } = useCriteriaSectionFulfillment(
  computed(() => vendorQuestions.value),
  computed(() => props.section.weight),
  computed(() => props.scoreRange)
)
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="font-semibold">{{ props.section.name }}</h3>
        </div>

        <div class="flex items-center gap-2">
          <UTooltip v-if="vendorQuestions.length > 0" text="Importierte Fragen dieser Sektion löschen">
            <UButton
              icon="i-lucide-shredder"
              color="neutral"
              variant="outline"
              aria-label="Fragen fuer Abschnitt loeschen"
              @click="isDeleteModalOpen = true"
            />
          </UTooltip>

          <UBadge color="neutral" variant="subtle" size="lg">
            {{ props.section.weight }}%
          </UBadge>

          <UBadge
            v-if="vendorQuestions.length > 0"
            :color="fulfillmentBadgeColor"
            variant="subtle"
            size="lg"
          >
            {{ fulfillmentLabel }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="vendorQuestions.length > 0" class="space-y-2">
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
              v-for="question in vendorQuestions"
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
      <div v-else>
        <TenderSectionCsvUpload
          inline
          :section-name="props.section.name"
          :section-weight="props.section.weight"
          :error-message="csvError"
          @uploaded="handleCsvUploaded"
          @error="handleCsvError"
        />
      </div>

      <p v-if="csvError && vendorQuestions.length > 0" class="text-sm text-error">
        {{ csvError }}
      </p>

      <p v-if="isSaving" class="text-sm ui-text-muted">
        Fragen werden gespeichert ...
      </p>

      <p v-if="isDeleting" class="text-sm ui-text-muted">
        Fragen werden gelöscht ...
      </p>
    </div>

    <UModal
      v-model:open="isDeleteModalOpen"
      title="Fragen löschen"
      description="Möchten Sie die importierten Fragen dieser Sektion wirklich löschen?"
    >
      <template #footer>
        <div class="flex w-full justify-center gap-2">
          <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false">
            Abbrechen
          </UButton>
          <UButton color="error" :loading="isDeleting" @click="handleDeleteQuestions">
            Löschen
          </UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
