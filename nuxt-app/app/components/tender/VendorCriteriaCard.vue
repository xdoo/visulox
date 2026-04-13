<script setup lang="ts">
import { ref } from 'vue'
import type { TenderSection, TenderSettings, TenderVendor } from '../../../shared/types/tenders'
import { calculateSectionFulfillmentPercentage } from '../../composables/useCriteriaSectionFulfillment'

const props = defineProps<{
  vendor: TenderVendor
  sections: TenderSection[]
  scoreRange: TenderSettings['scoreRange']
}>()

const chartRef = ref<{ downloadPng: (filename: string) => void, downloadSvg: (filename: string) => void } | null>(null)

const chartData = computed(() => {
  return props.sections.map(section => {
    const vendorEntry = section.questionsByVendor.find(entry => entry.vendorId === props.vendor.id)
    const questions = vendorEntry?.questions || []
    
    const fulfillment = calculateSectionFulfillmentPercentage(
      questions,
      section.weight,
      props.scoreRange
    )

    return {
      name: section.name,
      weight: section.weight,
      fulfillment: fulfillment || 0
    }
  })
})

const hasQuestions = computed(() => {
  return props.sections.some(section => {
    const vendorEntry = section.questionsByVendor.find(entry => entry.vendorId === props.vendor.id)
    return (vendorEntry?.questions.length || 0) > 0
  })
})

function downloadChart() {
  const filename = `${props.vendor.name.toLowerCase().replace(/\s+/g, '-')}-bewertung.png`
  chartRef.value?.downloadPng(filename)
}

function downloadChartSvg() {
  const filename = `${props.vendor.name.toLowerCase().replace(/\s+/g, '-')}-bewertung.svg`
  chartRef.value?.downloadSvg(filename)
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">
          {{ props.vendor.name }} - Bewertung
        </h3>

        <div class="flex items-center gap-2">
          <UTooltip text="Diagramm als PNG herunterladen">
            <UButton
              icon="i-lucide-image-down"
              color="neutral"
              variant="outline"
              aria-label="PNG herunterladen"
              :disabled="!hasQuestions"
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
              :disabled="!hasQuestions"
              @click="downloadChartSvg"
            >
              SVG
            </UButton>
          </UTooltip>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <p class="ui-text-muted">
        Visualisierung der Erfüllung pro Sektion für {{ props.vendor.name }}. Die Balkenlänge (blau) entspricht dem gewichteten Beitrag zur Gesamtwertung.
      </p>

      <div v-if="hasQuestions" class="rounded-lg border ui-border p-4 bg-gray-50/50">
        <TenderFulfillmentChart ref="chartRef" :data="chartData" />
      </div>

      <div
        v-else
        class="flex h-48 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
      >
        Noch keine Fragen für diesen Anbieter importiert.
      </div>
    </div>
  </UCard>
</template>
