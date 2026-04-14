<script setup lang="ts">
const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { data: tender, status, error } = await useTenderDetail(tenderId)

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

    <TenderValueScoreTable
      v-else-if="tender"
      :vendors="tender.vendors"
      :sections="tender.sections"
      :score-range="tender.settings.scoreRange"
      :cost-blocks="tender.costBlocks"
      :vendor-cost-items="tender.vendorCostItems"
      :consideration-years="tender.settings.considerationYears"
    />
  </div>
</template>
