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
  title: () => tender.value?.name || 'Ausschreibung'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        {{ tender?.name || 'Ausschreibung' }}
      </h2>
      <p class="ui-text-muted">
        Detailseite für Ausschreibung {{ tenderId }}.
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
      Lade Ausschreibungsdetails ...
    </div>

    <div v-else-if="tender" class="space-y-6">
      <TenderValueScoreBubbleCard
        :rows="valueScoreRows"
        :consideration-years="tender.settings.considerationYears"
        :palette="tender.settings.chartPalette"
      />

      <TenderValueScoreTable
        :rows="valueScoreRows"
        :consideration-years="tender.settings.considerationYears"
      />
    </div>
  </div>
</template>
