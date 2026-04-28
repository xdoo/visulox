<script setup lang="ts">
import { computed, ref } from 'vue'

import { downloadCategoryQuestionsJson } from '../../composables/useCategoryQuestionsJsonExport'
import { useCategoryResultAssessmentEditor } from '../../composables/useCategoryResultAssessmentEditor'
import { buildSectionVendorComparisonRows } from '../../composables/useTenderCategoryComparison'

import type { TenderSection, TenderSettings, TenderVendor } from '../../../shared/types/tenders'
import type { SectionVendorComparisonRow } from '../../composables/useTenderCategoryComparison'

const props = defineProps<{
  tenderId: string
  vendors: TenderVendor[]
  sections: TenderSection[]
  scoreRange: TenderSettings['scoreRange']
  palette?: TenderSettings['chartPalette']
}>()

type CategoryChartRef = {
  downloadPng: (filename: string) => void
  downloadSvg: (filename: string) => void
}

const chartRefs = ref<Record<string, CategoryChartRef | null>>({})
const {
  errorMessage: resultAssessmentErrorMessage,
  isResultAssessmentModalOpen,
  selectedSection,
  resultAssessment,
  isSavingResultAssessment,
  canSaveResultAssessment,
  openResultAssessmentEditor,
  saveResultAssessment
} = useCategoryResultAssessmentEditor(props.tenderId)

const rows = computed(() => buildSectionVendorComparisonRows(
  props.vendors,
  props.sections,
  props.scoreRange
))
const sectionsById = computed(() => new Map(props.sections.map((section) => [section.id, section])))

const hasAnyQuestions = computed(() => rows.value.some((row) => row.vendors.some((vendor) => vendor.hasQuestions)))

function isCategoryChartRef(instance: unknown): instance is CategoryChartRef {
  return Boolean(
    instance
    && typeof (instance as CategoryChartRef).downloadPng === 'function'
    && typeof (instance as CategoryChartRef).downloadSvg === 'function'
  )
}

function setChartRef(sectionId: string, instance: unknown) {
  chartRefs.value[sectionId] = isCategoryChartRef(instance) ? instance : null
}

function getChartFilename(row: SectionVendorComparisonRow, extension: 'png' | 'svg') {
  const slug = row.sectionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `kategorie-${slug || row.sectionId}.${extension}`
}

async function downloadAllChartsAsPng() {
  for (const row of rows.value) {
    chartRefs.value[row.sectionId]?.downloadPng(getChartFilename(row, 'png'))
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

async function downloadAllChartsAsSvg() {
  for (const row of rows.value) {
    chartRefs.value[row.sectionId]?.downloadSvg(getChartFilename(row, 'svg'))
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

function downloadCategoryQuestions(row: SectionVendorComparisonRow) {
  const section = sectionsById.value.get(row.sectionId)

  if (!section) {
    return
  }

  downloadCategoryQuestionsJson(section, props.vendors)
}

function openCategoryResultAssessmentEditor(row: SectionVendorComparisonRow) {
  const section = sectionsById.value.get(row.sectionId)

  if (!section) {
    return
  }

  openResultAssessmentEditor(section)
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <h3 class="font-semibold text-lg">
            Kategorien im Anbietervergleich
          </h3>
          <p class="text-sm ui-text-muted">
            Jede Kategorie zeigt die Erfüllung aller Anbieter auf einer festen Skala von 0 bis 100%. Die Anbieterreihenfolge bleibt in allen Charts identisch.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UTooltip text="Alle Diagramme als PNG herunterladen">
            <UButton
              icon="i-lucide-image-down"
              color="neutral"
              variant="outline"
              aria-label="Alle Diagramme als PNG herunterladen"
              :disabled="!hasAnyQuestions"
              @click="downloadAllChartsAsPng"
            >
              Alle PNG
            </UButton>
          </UTooltip>

          <UTooltip text="Alle Diagramme als SVG herunterladen">
            <UButton
              icon="i-lucide-image-down"
              color="neutral"
              variant="outline"
              aria-label="Alle Diagramme als SVG herunterladen"
              :disabled="!hasAnyQuestions"
              @click="downloadAllChartsAsSvg"
            >
              Alle SVG
            </UButton>
          </UTooltip>
        </div>
      </div>
    </template>

    <div v-if="hasAnyQuestions" class="grid gap-6 xl:grid-cols-2">
      <div
        v-for="row in rows"
        :key="row.sectionId"
        class="rounded-lg border ui-border p-4 bg-gray-50/50"
      >
        <div class="mb-3 flex justify-end gap-1">
          <UTooltip text="Ergebnisbewertung der Kategorie bearbeiten">
            <UButton
              icon="i-lucide-file-pen-line"
              color="neutral"
              variant="ghost"
              size="sm"
              square
              aria-label="Ergebnisbewertung der Kategorie bearbeiten"
              @click="openCategoryResultAssessmentEditor(row)"
            />
          </UTooltip>

          <UTooltip text="Kategoriefragen als JSON herunterladen">
            <UButton
              icon="i-lucide-file-json"
              color="neutral"
              variant="ghost"
              size="sm"
              square
              aria-label="Kategoriefragen als JSON herunterladen"
              :disabled="!row.vendors.some((vendor) => vendor.hasQuestions)"
              @click="downloadCategoryQuestions(row)"
            />
          </UTooltip>
        </div>

        <TenderCategoryComparisonChart
          :ref="(instance) => setChartRef(row.sectionId, instance)"
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

    <TenderCategoryResultAssessmentModal
      v-model:open="isResultAssessmentModalOpen"
      v-model:result-assessment="resultAssessment"
      :selected-section="selectedSection"
      :is-saving="isSavingResultAssessment"
      :can-save="canSaveResultAssessment"
      :error-message="resultAssessmentErrorMessage"
      @submit="saveResultAssessment"
    />
  </UCard>
</template>
