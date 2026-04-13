<script setup lang="ts">
import type { TenderCostBlock, TenderVendor, TenderVendorCostItem } from '../../../shared/types/tenders'
import { useVendorCostSummaries } from '../../composables/useVendorCostSummaries'

const props = defineProps<{
  tenderId: string
  vendor: TenderVendor
  costBlocks: TenderCostBlock[]
  vendorCostItems: TenderVendorCostItem[]
  considerationYears: number
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

    <UAlert
      v-if="hasInvalidAmounts"
      color="warning"
      variant="subtle"
      title="Ungültige Beträge"
      description="Bitte geben Sie nur leere Werte oder nicht negative Zahlen ein."
    />

    <div class="grid gap-6 xl:grid-cols-2">
      <TenderVendorCostGroupCard
        title="Projektkosten"
        description="Einmalkosten und projektbezogene Kostenblöcke."
        :rows="projectRows"
        :summaries="projectSummaries"
        @update-amount="updateAmount"
      />

      <TenderVendorCostGroupCard
        title="Run-Kosten"
        description="Laufende betriebliche oder infrastrukturelle Kostenblöcke."
        :rows="runRows"
        :summaries="runSummaries"
        @update-amount="updateAmount"
      />
    </div>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      :description="errorMessage"
    />
  </div>
</template>
