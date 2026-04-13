<script setup lang="ts">
import { ref } from 'vue'
import type { TenderSection, TenderSettings, TenderVendor } from '../../../shared/types/tenders'
import {
  calculateSectionContributionPercentage,
  calculateSectionFulfillmentPercentage
} from '../../composables/useCriteriaSectionFulfillment'

const props = defineProps<{
  vendors: TenderVendor[]
  sections: TenderSection[]
  scoreRange: TenderSettings['scoreRange']
  palette?: TenderSettings['chartPalette']
}>()

const chartRef = ref<{ downloadPng: (filename: string) => void, downloadSvg: (filename: string) => void } | null>(null)

const vendorScores = computed(() => {
  return props.vendors.map(vendor => {
    let totalScore = 0
    const sectionScores = props.sections.map(section => {
      const vendorEntry = section.questionsByVendor.find(entry => entry.vendorId === vendor.id)
      const questions = vendorEntry?.questions || []
      
      const fulfillment = calculateSectionFulfillmentPercentage(
        questions,
        section.weight,
        props.scoreRange
      ) || 0

      const contribution = calculateSectionContributionPercentage(
        questions,
        section.weight,
        props.scoreRange
      ) || 0
      totalScore += contribution

      return {
        sectionId: section.id,
        sectionName: section.name,
        weight: section.weight,
        fulfillment,
        contribution
      }
    })

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      totalScore,
      sectionScores
    }
  })
})

const hasAnyQuestions = computed(() => {
  return props.sections.some(section => 
    section.questionsByVendor.some(entry => entry.questions.length > 0)
  )
})

function downloadChart() {
  chartRef.value?.downloadPng('anbietervergleich.png')
}

function downloadChartSvg() {
  chartRef.value?.downloadSvg('anbietervergleich.svg')
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">
          Anbietervergleich
        </h3>

        <div class="flex items-center gap-2">
          <UTooltip text="Diagramm als PNG herunterladen">
            <UButton
              icon="i-lucide-image-down"
              color="neutral"
              variant="outline"
              aria-label="PNG herunterladen"
              :disabled="!hasAnyQuestions"
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
              :disabled="!hasAnyQuestions"
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
        Gesamtübersicht der gewichteten Erfüllung aller Anbieter. Ein Anbieter erreicht 100%, wenn alle Kriterien vollständig erfüllt sind.
      </p>

      <div v-if="hasAnyQuestions" class="rounded-lg border ui-border p-4 bg-gray-50/50">
        <TenderOverviewChart ref="chartRef" :scores="vendorScores" :palette="palette" />
      </div>

      <div
        v-else
        class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
      >
        Es wurden noch keine Fragen importiert. Der Vergleich wird angezeigt, sobald Daten vorliegen.
      </div>
    </div>
  </UCard>
</template>
