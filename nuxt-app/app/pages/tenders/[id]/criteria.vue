<script setup lang="ts">
const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { data: tender, status, error } = await useTenderDetail(tenderId)

useSeoMeta({
  title: () => {
    const tenderName = tender.value?.name || 'Ausschreibung'
    return `${tenderName} - Kriterienkatalog`
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        Kriterienkatalog
      </h2>
      <p class="ui-text-muted">
        Ausschreibung {{ tender?.name || tenderId }}.
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
      Lade Anbieter und Kriterienkatalog ...
    </div>

    <TenderVendorTabs v-else :vendors="tender?.vendors || []">
      <template #overview>
        <TenderOverviewCard
          :vendors="tender?.vendors || []"
          :sections="tender?.sections || []"
          :max-points="tender?.settings.scoreRange[1] || 10"
          :palette="tender?.settings.chartPalette"
        />
      </template>

      <template #vendor="{ vendor }">
        <div class="space-y-4">
          <TenderVendorCriteriaCard
            v-if="vendor"
            :vendor="vendor"
            :sections="tender?.sections || []"
            :max-points="tender?.settings.scoreRange[1] || 10"
          />

          <TenderCriteriaSections
            :sections="tender?.sections || []"
            :vendor-id="vendor?.id || ''"
            :max-points="tender?.settings.scoreRange[1] || 10"
          />
        </div>
      </template>
    </TenderVendorTabs>
  </div>
</template>
