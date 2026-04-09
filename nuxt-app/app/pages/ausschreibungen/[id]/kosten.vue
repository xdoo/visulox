<script setup lang="ts">
import AusschreibungVendorTabs from '../../../components/AusschreibungVendorTabs.vue'

const route = useRoute()
const ausschreibungId = computed(() => String(route.params.id || ''))
const { data: ausschreibung, status, error } = await useAusschreibungDetail(ausschreibungId)

useSeoMeta({
  title: () => {
    const ausschreibungName = ausschreibung.value?.name || 'Ausschreibung'
    return `${ausschreibungName} - Kosten`
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
        Ausschreibung {{ ausschreibung?.name || ausschreibungId }}.
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

    <AusschreibungVendorTabs v-else :vendors="ausschreibung?.vendors || []">
      <template #overview>
        <UCard>
          <template #header>
            <h3 class="font-semibold">Gesamtübersicht</h3>
          </template>

          <p class="ui-text-muted">
            Gesamtsicht auf die Kosten der Ausschreibung {{ ausschreibung?.name }}.
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
    </AusschreibungVendorTabs>
  </div>
</template>
