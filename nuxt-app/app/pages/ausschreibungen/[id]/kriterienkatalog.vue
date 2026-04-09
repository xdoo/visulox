<script setup lang="ts">
import AusschreibungCriteriaSections from '../../../components/AusschreibungCriteriaSections.vue'
import AusschreibungVendorTabs from '../../../components/AusschreibungVendorTabs.vue'

const route = useRoute()
const ausschreibungId = computed(() => String(route.params.id || ''))
const { data: ausschreibung, status, error } = await useAusschreibungDetail(ausschreibungId)

useSeoMeta({
  title: () => {
    const ausschreibungName = ausschreibung.value?.name || 'Ausschreibung'
    return `${ausschreibungName} - Kriterienkatalog`
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
      Lade Anbieter und Kriterienkatalog ...
    </div>

    <AusschreibungVendorTabs v-else :vendors="ausschreibung?.vendors || []">
      <template #overview>
        <UCard>
          <template #header>
            <h3 class="font-semibold">Gesamtübersicht</h3>
          </template>

          <p class="ui-text-muted">
            Gesamtsicht auf den Kriterienkatalog der Ausschreibung {{ ausschreibung?.name }}.
          </p>
        </UCard>
      </template>

      <template #vendor="{ vendor }">
        <div class="space-y-4">
          <UCard>
            <template #header>
              <h3 class="font-semibold">
                {{ vendor?.name || 'Anbieter' }}
              </h3>
            </template>

            <p class="ui-text-muted">
              Kriterienkatalog für {{ vendor?.name || 'den ausgewählten Anbieter' }}.
            </p>
          </UCard>

          <AusschreibungCriteriaSections :sections="ausschreibung?.sections || []" />
        </div>
      </template>
    </AusschreibungVendorTabs>
  </div>
</template>
