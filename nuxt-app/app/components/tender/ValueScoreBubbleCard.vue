<script setup lang="ts">
import { computed, ref } from 'vue'

import type { TenderSettings } from '../../../shared/types/tenders'
import type { TenderValueScoreRow } from '../../composables/useTenderValueScore'

const props = defineProps<{
  rows: TenderValueScoreRow[]
  considerationYears: TenderSettings['considerationYears']
  palette?: TenderSettings['chartPalette']
}>()

const chartRef = ref<{ downloadPng: (filename: string) => void, downloadSvg: (filename: string) => void } | null>(null)
const hasChartData = computed(() => props.rows.some((row) => row.balancedScore !== null && row.normalizedCost !== null))

function downloadChart() {
  chartRef.value?.downloadPng('value-score-bubble-chart.png')
}

function downloadChartSvg() {
  chartRef.value?.downloadSvg('value-score-bubble-chart.svg')
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <h3 class="font-semibold text-lg">
            Value Score Bubble Chart
          </h3>
          <p class="text-sm ui-text-muted">
            Das Diagramm zeigt Kosten normiert, Nutzen normiert und den Balanced Score als Bubble-Größe. Die Gesamtkosten beziehen sich auf {{ props.considerationYears }} Jahre.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UTooltip text="Diagramm als PNG herunterladen">
            <UButton
              icon="i-lucide-image-down"
              color="neutral"
              variant="outline"
              aria-label="PNG herunterladen"
              :disabled="!hasChartData"
              @click="downloadChart"
            >
              PNG
            </UButton>
          </UTooltip>

          <UTooltip text="Diagramm als SVG herunterladen">
            <UButton
              icon="i-lucide-image-down"
              color="neutral"
              variant="outline"
              aria-label="SVG herunterladen"
              :disabled="!hasChartData"
              @click="downloadChartSvg"
            >
              SVG
            </UButton>
          </UTooltip>
        </div>
      </div>
    </template>

    <div v-if="hasChartData" class="rounded-lg border ui-border p-4 bg-gray-50/50">
      <TenderValueScoreBubbleChart
        ref="chartRef"
        :rows="props.rows"
        :palette="props.palette"
      />
    </div>

    <div
      v-else
      class="flex h-72 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
    >
      Für das Bubble Chart werden sowohl gewichtete Kriterienerfüllung als auch valide Gesamtkosten benötigt.
    </div>
  </UCard>
</template>
