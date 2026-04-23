<script setup lang="ts">
import { buildTenderValueScoreRows } from '../../../composables/useTenderValueScore'

const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { data: tender, status, error } = await useTenderDetail(tenderId)

const valueScoreRows = computed(() => {
  if (!tender.value) {
    return []
  }

  return buildTenderValueScoreRows(
    tender.value.vendors,
    tender.value.sections,
    tender.value.settings.scoreRange,
    tender.value.costBlocks,
    tender.value.vendorCostItems,
    tender.value.settings.considerationYears
  )
})

useSeoMeta({
  title: () => {
    const tenderName = tender.value?.name || 'Ausschreibung'
    return `${tenderName} - Zusammenfassung`
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        Zusammenfassung
      </h2>
      <p class="ui-text-muted">
        Management- und Reportübersicht für Ausschreibung {{ tender?.name || tenderId }}.
      </p>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Ausschreibungsdetails konnten nicht geladen werden."
    />

    <div
      v-else-if="status === 'pending'"
      class="flex h-96 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
    >
      Lade Zusammenfassung ...
    </div>

    <div v-else-if="tender" class="space-y-6">
      <TenderValueScoreBubbleCard
        :rows="valueScoreRows"
        :consideration-years="tender.settings.considerationYears"
        :palette="tender.settings.chartPalette"
      />

      <TenderCostOverviewCard
        :vendors="tender.vendors"
        :cost-blocks="tender.costBlocks"
        :vendor-cost-items="tender.vendorCostItems"
        :consideration-years="tender.settings.considerationYears"
        :palette="tender.settings.chartPalette"
      />

      <TenderOverviewCard
        :vendors="tender.vendors"
        :sections="tender.sections"
        :score-range="tender.settings.scoreRange"
        :palette="tender.settings.chartPalette"
      />

      <TenderCategoryComparisonTable
        :vendors="tender.vendors"
        :sections="tender.sections"
        :score-range="tender.settings.scoreRange"
      />

      <TenderCategoryComparisonOverview
        :vendors="tender.vendors"
        :sections="tender.sections"
        :score-range="tender.settings.scoreRange"
        :palette="tender.settings.chartPalette"
      />
    </div>
  </div>
</template>
