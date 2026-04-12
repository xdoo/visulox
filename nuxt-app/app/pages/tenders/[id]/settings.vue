<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import { defaultTenderSettings } from '../../../../shared/constants/tender-settings'

const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { data: tender, status, error } = await useTenderDetail(tenderId)

const settingsTab = ref<'general' | 'criteria' | 'costs'>('general')
const items = computed<TabsItem[]>(() => ([
  {
    label: 'Allgemein',
    value: 'general',
    icon: 'i-lucide-sliders-horizontal'
  },
  {
    label: 'Kriterienkatalog',
    value: 'criteria',
    icon: 'i-lucide-list-checks'
  },
  {
    label: 'Kosten',
    value: 'costs',
    icon: 'i-lucide-chart-column'
  }
]))

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
      <UTabs
        v-model="settingsTab"
        :items="items"
        color="neutral"
        variant="link"
        class="space-y-6"
      >
        <template #content="{ item }">
          <TenderSettingsGeneralCard
            v-if="item.value === 'general'"
            :tender-id="tenderId"
            :settings="tender?.settings || defaultTenderSettings"
          />

          <div v-else-if="item.value === 'criteria'" class="space-y-6">
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

          <TenderSettingsCostsCard
            v-else
            :tender-id="tenderId"
            :cost-blocks="tender?.costBlocks || []"
          />
        </template>
      </UTabs>
    </div>
  </div>
</template>
