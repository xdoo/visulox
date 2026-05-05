<script setup lang="ts">
import { defaultTenderChartPalette } from '~~/shared/constants/tender-settings'
import type { TenderCostBlock, TenderVendor, TenderVendorCostItem } from '../../../shared/types/tenders'
import { downloadVendorCostBlocksJson } from '../../composables/useVendorCostBlocksJsonExport'
import { useVendorCostAssessmentsEditor } from '../../composables/useVendorCostAssessmentsEditor'
import { useVendorCostSummaries } from '../../composables/useVendorCostSummaries'

const props = defineProps<{
  tenderId: string
  vendor: TenderVendor
  costBlocks: TenderCostBlock[]
  vendorCostItems: TenderVendorCostItem[]
  considerationYears: number
  palette?: typeof defaultTenderChartPalette
}>()

const {
  errorMessage,
  isSaving,
  projectRows,
  runRows,
  projectTotal,
  runTotal,
  runTotalOverConsiderationYears,
  canSave,
  hasInvalidAmounts,
  updateAmount,
  updateComment,
  saveComment,
  save
} = useTenderVendorCosts(
  props.tenderId,
  () => props.vendor,
  () => props.costBlocks,
  () => props.vendorCostItems,
  () => props.considerationYears
)

const { projectSummaries, runSummaries } = useVendorCostSummaries(
  () => projectTotal.value,
  () => runTotal.value,
  () => runTotalOverConsiderationYears.value,
  () => props.considerationYears
)
const {
  errorMessage: costAssessmentErrorMessage,
  isCostAssessmentModalOpen,
  selectedKind,
  assessment,
  modalTitle,
  isSavingCostAssessment,
  canSaveCostAssessment,
  openCostAssessmentEditor,
  saveCostAssessment
} = useVendorCostAssessmentsEditor(props.tenderId)

async function handleCommentSaved(costBlockId: string, value: string) {
  updateComment(costBlockId, value)
  await saveComment(costBlockId, value)
}

function downloadCostBlocksJson() {
  downloadVendorCostBlocksJson(props.vendor, projectRows.value, runRows.value)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h3 class="font-semibold text-lg">
          {{ props.vendor.name }}
        </h3>
        <p class="text-sm ui-text-muted">
          Pflegen Sie die Kostenpositionen für diesen Anbieter getrennt nach Projekt- und Run-Kosten.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UTooltip text="Kostenblöcke als JSON herunterladen">
          <UButton
            icon="i-lucide-file-json"
            color="neutral"
            variant="outline"
            square
            aria-label="Kostenblöcke als JSON herunterladen"
            @click="downloadCostBlocksJson"
          />
        </UTooltip>

        <UButton
          icon="i-lucide-save"
          color="primary"
          :loading="isSaving"
          :disabled="!canSave"
          @click="save"
        >
          Speichern
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="hasInvalidAmounts"
      color="warning"
      variant="subtle"
      title="Ungültige Beträge"
      description="Bitte geben Sie nur leere Werte oder nicht negative Zahlen ein."
    />

    <div class="grid gap-6">
      <div class="grid gap-6 xl:grid-cols-2">
        <TenderVendorCostDonutChart
          title="Projektkosten nach Kostenblock"
          kind="project"
          :rows="projectRows"
          :consideration-years="props.considerationYears"
          :palette="props.palette"
        >
          <template #header-actions>
            <UTooltip text="Projektkosten-Bewertungstext bearbeiten">
              <UButton
                icon="i-lucide-file-pen-line"
                color="neutral"
                variant="outline"
                square
                aria-label="Projektkosten-Bewertungstext bearbeiten"
                @click="openCostAssessmentEditor(props.vendor, 'project')"
              />
            </UTooltip>
          </template>
        </TenderVendorCostDonutChart>

        <TenderVendorCostDonutChart
          title="Run-Kosten nach Kostenblock"
          kind="run"
          :rows="runRows"
          :consideration-years="props.considerationYears"
          :palette="props.palette"
        >
          <template #header-actions>
            <UTooltip text="Run-Kosten-Bewertungstext bearbeiten">
              <UButton
                icon="i-lucide-file-pen-line"
                color="neutral"
                variant="outline"
                square
                aria-label="Run-Kosten-Bewertungstext bearbeiten"
                @click="openCostAssessmentEditor(props.vendor, 'run')"
              />
            </UTooltip>
          </template>
        </TenderVendorCostDonutChart>
      </div>

      <TenderVendorCostGroupCard
        title="Projektkosten"
        description="Einmalkosten und projektbezogene Kostenblöcke."
        :rows="projectRows"
        :summaries="projectSummaries"
        @update-amount="updateAmount"
        @save-comment="handleCommentSaved"
      />

      <TenderVendorCostGroupCard
        title="Run-Kosten"
        description="Laufende betriebliche oder infrastrukturelle Kostenblöcke."
        :rows="runRows"
        :summaries="runSummaries"
        @update-amount="updateAmount"
        @save-comment="handleCommentSaved"
      />
    </div>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      :description="errorMessage"
    />

    <TenderVendorCostAssessmentModal
      v-model:open="isCostAssessmentModalOpen"
      v-model:assessment="assessment"
      :title="modalTitle"
      :kind="selectedKind"
      :is-saving="isSavingCostAssessment"
      :can-save="canSaveCostAssessment"
      :error-message="costAssessmentErrorMessage"
      @submit="saveCostAssessment"
    />
  </div>
</template>
