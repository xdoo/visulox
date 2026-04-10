<script setup lang="ts">
import type { TenderSection, TenderVendor } from '../../../shared/types/tenders'
import { calculateSectionFulfillmentPercentage } from '../../composables/useCriteriaSectionFulfillment'

const props = defineProps<{
  vendors: TenderVendor[]
  sections: TenderSection[]
  maxPoints: number
  palette?: string[]
}>()

const vendorScores = computed(() => {
  return props.vendors.map(vendor => {
    let totalScore = 0
    const sectionScores = props.sections.map(section => {
      const vendorEntry = section.questionsByVendor.find(entry => entry.vendorId === vendor.id)
      const questions = vendorEntry?.questions || []
      
      const fulfillment = calculateSectionFulfillmentPercentage(
        questions,
        section.weight,
        props.maxPoints
      ) || 0

      const contribution = (section.weight * fulfillment) / 100
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
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">
          Anbietervergleich
        </h3>
      </div>
    </template>

    <div class="space-y-6">
      <p class="ui-text-muted">
        Gesamtübersicht der gewichteten Erfüllung aller Anbieter. Ein Anbieter erreicht 100%, wenn alle Kriterien vollständig erfüllt sind.
      </p>

      <div v-if="hasAnyQuestions" class="rounded-lg border ui-border p-4 bg-gray-50/50">
        <TenderOverviewChart :scores="vendorScores" :palette="palette" />
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
