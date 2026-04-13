<script setup lang="ts">
import { ref } from 'vue'
import type {
  TenderCostBlock,
  TenderSettings,
  TenderVendor,
  TenderVendorCostItem
} from '../../../shared/types/tenders'
import {
  buildCombinedVendorCostOverviewRows,
  buildVendorCostOverviewRows
} from '../../composables/useTenderCostOverview'

const props = defineProps<{
  vendors: TenderVendor[]
  costBlocks: TenderCostBlock[]
  vendorCostItems: TenderVendorCostItem[]
  considerationYears: TenderSettings['considerationYears']
  palette?: TenderSettings['chartPalette']
}>()

const combinedChartRef = ref<{ downloadPng: (filename: string) => void, downloadSvg: (filename: string) => void } | null>(null)
const projectChartRef = ref<{ downloadPng: (filename: string) => void, downloadSvg: (filename: string) => void } | null>(null)
const runChartRef = ref<{ downloadPng: (filename: string) => void, downloadSvg: (filename: string) => void } | null>(null)

const overviewRows = computed(() => buildVendorCostOverviewRows(
  props.vendors,
  props.costBlocks,
  props.vendorCostItems,
  props.considerationYears
))

const projectRows = computed(() => overviewRows.value.filter((row) => row.kind === 'project'))
const runRows = computed(() => overviewRows.value.filter((row) => row.kind === 'run'))
const combinedRows = computed(() => buildCombinedVendorCostOverviewRows(overviewRows.value))
const hasProjectCosts = computed(() => projectRows.value.some((row) => row.total > 0))
const hasRunCosts = computed(() => runRows.value.some((row) => row.total > 0))
const hasCombinedCosts = computed(() => combinedRows.value.some((row) => row.total > 0))
const hasAnyCosts = computed(() => hasProjectCosts.value || hasRunCosts.value || hasCombinedCosts.value)

function downloadCombinedChart() {
  combinedChartRef.value?.downloadPng('kostenvergleich-gesamt.png')
}

function downloadCombinedChartSvg() {
  combinedChartRef.value?.downloadSvg('kostenvergleich-gesamt.svg')
}

function downloadProjectChart() {
  projectChartRef.value?.downloadPng('kostenvergleich-projekt.png')
}

function downloadProjectChartSvg() {
  projectChartRef.value?.downloadSvg('kostenvergleich-projekt.svg')
}

function downloadRunChart() {
  runChartRef.value?.downloadPng('kostenvergleich-run.png')
}

function downloadRunChartSvg() {
  runChartRef.value?.downloadSvg('kostenvergleich-run.svg')
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">
          Kostenvergleich
        </h3>
      </div>
    </template>

    <div class="space-y-6">
      <p class="ui-text-muted">
        Vergleich der Projektkosten sowie der Run-Kosten über den Betrachtungszeitraum von {{ props.considerationYears }} Jahren.
      </p>

      <div v-if="hasAnyCosts" class="space-y-6">
        <UCard>
          <template #header>
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h4 class="font-semibold">
                  Gesamtkosten
                </h4>
                <p class="text-sm ui-text-muted">
                  Gesamtvergleich aller Anbieter mit gestapelten Projekt- und Run-Kosten. Die Run-Kosten werden über {{ props.considerationYears }} Jahre betrachtet.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <UTooltip text="Diagramm als PNG herunterladen">
                  <UButton
                    icon="i-lucide-image-down"
                    color="neutral"
                    variant="outline"
                    aria-label="PNG herunterladen"
                    :disabled="!hasCombinedCosts"
                    @click="downloadCombinedChart"
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
                    :disabled="!hasCombinedCosts"
                    @click="downloadCombinedChartSvg"
                  >
                    SVG
                  </UButton>
                </UTooltip>
              </div>
            </div>
          </template>

          <div v-if="hasCombinedCosts" class="rounded-lg border ui-border p-4 bg-gray-50/50">
            <TenderCostOverviewChart
              ref="combinedChartRef"
              kind="combined"
              :rows="combinedRows"
              :palette="props.palette"
            />
          </div>

          <div
            v-else
            class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
          >
            Es wurden noch keine Gesamtkosten erfasst.
          </div>
        </UCard>

        <div class="grid gap-6 xl:grid-cols-2">
          <UCard>
            <template #header>
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <h4 class="font-semibold">
                    Projektkosten
                  </h4>
                  <p class="text-sm ui-text-muted">
                    Einmalige Projekt- und Lizenzkosten im direkten Anbieter-Vergleich.
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <UTooltip text="Diagramm als PNG herunterladen">
                    <UButton
                      icon="i-lucide-image-down"
                      color="neutral"
                      variant="outline"
                      aria-label="PNG herunterladen"
                      :disabled="!hasProjectCosts"
                      @click="downloadProjectChart"
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
                      :disabled="!hasProjectCosts"
                      @click="downloadProjectChartSvg"
                    >
                      SVG
                    </UButton>
                  </UTooltip>
                </div>
              </div>
            </template>

            <div v-if="hasProjectCosts" class="rounded-lg border ui-border p-4 bg-gray-50/50">
              <TenderCostOverviewChart
                ref="projectChartRef"
                kind="project"
                :rows="projectRows"
                :palette="props.palette"
              />
            </div>

            <div
              v-else
              class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
            >
              Es wurden noch keine Projektkosten erfasst.
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1">
                  <h4 class="font-semibold">
                    Run-Kosten
                  </h4>
                  <p class="text-sm ui-text-muted">
                    Laufende Kosten über {{ props.considerationYears }} Jahre im Anbieter-Vergleich.
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <UTooltip text="Diagramm als PNG herunterladen">
                    <UButton
                      icon="i-lucide-image-down"
                      color="neutral"
                      variant="outline"
                      aria-label="PNG herunterladen"
                      :disabled="!hasRunCosts"
                      @click="downloadRunChart"
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
                      :disabled="!hasRunCosts"
                      @click="downloadRunChartSvg"
                    >
                      SVG
                    </UButton>
                  </UTooltip>
                </div>
              </div>
            </template>

            <div v-if="hasRunCosts" class="rounded-lg border ui-border p-4 bg-gray-50/50">
              <TenderCostOverviewChart
                ref="runChartRef"
                kind="run"
                :rows="runRows"
                :palette="props.palette"
              />
            </div>

            <div
              v-else
              class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
            >
              Es wurden noch keine Run-Kosten erfasst.
            </div>
          </UCard>
        </div>
      </div>

      <div
        v-else
        class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
      >
        Es wurden noch keine Kosten erfasst. Der Vergleich wird angezeigt, sobald Anbieterkosten gepflegt wurden.
      </div>
    </div>
  </UCard>
</template>
