<script setup lang="ts">
import { computed } from 'vue'

import { buildSectionVendorComparisonRows } from '../../composables/useTenderCategoryComparison'

import type { TenderSection, TenderSettings, TenderVendor } from '../../../shared/types/tenders'

const props = defineProps<{
  vendors: TenderVendor[]
  sections: TenderSection[]
  scoreRange: TenderSettings['scoreRange']
  palette?: TenderSettings['chartPalette']
}>()

const rows = computed(() => buildSectionVendorComparisonRows(
  props.vendors,
  props.sections,
  props.scoreRange
))

const hasAnyQuestions = computed(() => rows.value.some((row) => row.vendors.some((vendor) => vendor.hasQuestions)))
</script>

<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h3 class="font-semibold text-lg">
          Kategorien im Anbietervergleich
        </h3>
        <p class="text-sm ui-text-muted">
          Jede Kategorie zeigt die Erfüllung aller Anbieter auf einer festen Skala von 0 bis 100%. Die Anbieterreihenfolge bleibt in allen Charts identisch.
        </p>
      </div>
    </template>

    <div v-if="hasAnyQuestions" class="grid gap-6 xl:grid-cols-2">
      <div
        v-for="row in rows"
        :key="row.sectionId"
        class="rounded-lg border ui-border p-4 bg-gray-50/50"
      >
        <TenderCategoryComparisonChart
          :row="row"
          :palette="props.palette"
        />
      </div>
    </div>

    <div
      v-else
      class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
    >
      Es wurden noch keine Fragen importiert. Die Kategorievergleiche erscheinen, sobald Daten vorliegen.
    </div>
  </UCard>
</template>
