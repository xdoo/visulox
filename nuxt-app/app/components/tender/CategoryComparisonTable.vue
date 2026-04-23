<script setup lang="ts">
import { computed } from 'vue'

import { buildSectionVendorComparisonRows } from '../../composables/useTenderCategoryComparison'

import type { TenderSection, TenderSettings, TenderVendor } from '../../../shared/types/tenders'

const props = defineProps<{
  vendors: TenderVendor[]
  sections: TenderSection[]
  scoreRange: TenderSettings['scoreRange']
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
          Kategorien im Überblick
        </h3>
        <p class="text-sm ui-text-muted">
          Kompakte Tabelle der Kategorieerfüllung je Anbieter. Fett markiert ist der beste Anbieter je Kategorie.
        </p>
      </div>
    </template>

    <div v-if="hasAnyQuestions" class="overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr class="text-left">
            <th class="sticky left-0 z-10 bg-white px-4 py-3 font-semibold dark:bg-gray-900">
              Kategorie
            </th>
            <th class="px-4 py-3 text-right font-semibold">
              Gewicht
            </th>
            <th
              v-for="vendor in props.vendors"
              :key="vendor.id"
              class="px-4 py-3 text-right font-semibold"
            >
              {{ vendor.name }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in rows"
            :key="row.sectionId"
            class="border-t ui-border"
          >
            <td class="sticky left-0 z-10 border-t ui-border bg-white px-4 py-3 font-medium dark:bg-gray-900">
              {{ row.sectionName }}
            </td>
            <td class="border-t ui-border px-4 py-3 text-right ui-text-muted">
              {{ Math.round(row.sectionWeight) }}%
            </td>
            <td
              v-for="vendor in row.vendors"
              :key="vendor.vendorId"
              class="border-t ui-border px-4 py-3 text-right"
              :class="vendor.isBest ? 'font-semibold text-primary' : 'ui-text-muted'"
            >
              <span v-if="vendor.hasQuestions">{{ Math.round(vendor.fulfillment) }}%</span>
              <span v-else>–</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="flex h-48 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
    >
      Es wurden noch keine Fragen importiert. Die Kategorieübersicht erscheint, sobald Daten vorliegen.
    </div>
  </UCard>
</template>
