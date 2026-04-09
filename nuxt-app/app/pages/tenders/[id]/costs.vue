<script setup lang="ts">
const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { data: tender, status, error } = await useTenderDetail(tenderId)

useSeoMeta({
  title: () => {
    const tenderName = tender.value?.name || 'Ausschreibung'
    return `${tenderName} - Kosten`
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        Kosten
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
      Lade Anbieter und Kostenansicht ...
    </div>

    <TenderVendorTabs v-else :vendors="tender?.vendors || []">
      <template #overview>
        <UCard>
          <template #header>
            <h3 class="font-semibold">Gesamtübersicht</h3>
          </template>

          <p class="ui-text-muted">
            Gesamtsicht auf die Kosten der Ausschreibung {{ tender?.name }}.
          </p>
        </UCard>
      </template>

      <template #vendor="{ vendor }">
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              {{ vendor?.name || 'Anbieter' }}
            </h3>
          </template>

          <p class="ui-text-muted">
            Kostenansicht für {{ vendor?.name || 'den ausgewählten Anbieter' }}.
          </p>
        </UCard>
      </template>
    </TenderVendorTabs>
  </div>
</template>
