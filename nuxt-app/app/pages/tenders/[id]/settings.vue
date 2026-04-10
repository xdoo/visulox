<script setup lang="ts">
const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { data: tender, status, error } = await useTenderDetail(tenderId)

useSeoMeta({
  title: () => {
    const tenderName = tender.value?.name || 'Ausschreibung'
    return `${tenderName} - Settings`
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        Settings
      </h2>
      <p class="ui-text-muted">
        Ausschreibungsweite Einstellungen für {{ tender?.name || tenderId }}.
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
      Lade Ausschreibungs-Settings ...
    </div>

    <div v-else class="space-y-6">
      <UAlert
        color="neutral"
        variant="subtle"
        title="Hinweis"
        description="Abschnitte und Anbieter können nicht gelöscht werden, sobald dafür Fragen importiert wurden. Bei Abschnitten bleibt der Name bearbeitbar, das Gewicht ist jedoch gesperrt, solange für diesen Abschnitt bereits Fragen importiert wurden."
      />

      <div class="grid gap-6 xl:grid-cols-2">
        <TenderSettingsSectionsCard
          :tender-id="tenderId"
          :sections="tender?.sections || []"
        />

        <TenderSettingsVendorsCard
          :tender-id="tenderId"
          :vendors="tender?.vendors || []"
          :sections="tender?.sections || []"
        />
      </div>
    </div>
  </div>
</template>
