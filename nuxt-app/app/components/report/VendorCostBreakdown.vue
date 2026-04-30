<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { defaultTenderChartPalette } from '~~/shared/constants/tender-settings'
import { formatCostChartValue } from '../../composables/useTenderCostOverview'
import type { VendorCostOverviewRow } from '../../composables/useTenderCostOverview'

type CostKind = 'project' | 'run'

interface DonutSegment {
  id: string
  name: string
  value: number
  color: string
}

const props = defineProps<{
  vendorName: string
  projectRow: VendorCostOverviewRow | null
  runRow: VendorCostOverviewRow | null
  projectAssessment: string
  runAssessment: string
  considerationYears: number
  palette?: typeof defaultTenderChartPalette
  renderer?: 'canvas' | 'svg'
  width?: string
}>()

const isVisible = ref(false)

onMounted(() => {
  nextTick(() => {
    isVisible.value = true
  })
})

const chartPalette = computed(() => props.palette || defaultTenderChartPalette)
const initOptions = computed(() => ({
  renderer: props.renderer || 'canvas'
}))

function getPaletteEntry(index: number) {
  const palette = chartPalette.value
  const fallbackEntry = defaultTenderChartPalette[0] ?? {
    fillColor: '#0D57A6',
    textColor: '#FFFFFF'
  }

  if (palette.length === 0) {
    return fallbackEntry
  }

  return palette[index % palette.length] ?? fallbackEntry
}

function getSegments(row: VendorCostOverviewRow | null) {
  if (!row) {
    return [] as DonutSegment[]
  }

  return row.segments
    .filter((segment) => segment.value > 0)
    .map((segment, index) => ({
      id: segment.costBlockId,
      name: segment.name,
      value: segment.value,
      color: getPaletteEntry(index).fillColor
    }))
}

function buildChartOption(kind: CostKind, row: VendorCostOverviewRow | null): EChartsOption {
  const segments = getSegments(row)
  const legendRowCount = Math.max(1, Math.ceil(segments.length / 2))
  const legendBottomSpace = 20 + (legendRowCount * 22)

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const value = Number(params?.value || 0)
        const share = Number(params?.percent || 0)

        return `
          <div class="font-sans p-1">
            <div class="font-bold mb-1">${String(params?.name || '')}</div>
            <div class="flex justify-between gap-4"><span>Betrag:</span><b>${formatCostChartValue(value)} €</b></div>
            <div class="flex justify-between gap-4"><span>Anteil:</span><b>${share.toFixed(1)}%</b></div>
          </div>
        `
      }
    },
    legend: {
      show: true,
      left: 'center',
      right: 0,
      bottom: 0,
      orient: 'horizontal',
      itemWidth: 10,
      itemHeight: 10,
      width: '92%',
      data: segments.map((segment) => segment.name)
    },
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: legendBottomSpace
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '38%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        data: segments.map((segment) => ({
          value: segment.value,
          name: segment.name,
          itemStyle: {
            color: segment.color
          }
        }))
      }
    ]
  }
}

const projectHasData = computed(() => (props.projectRow?.total || 0) > 0)
const runHasData = computed(() => (props.runRow?.total || 0) > 0)
const projectOption = computed(() => buildChartOption('project', props.projectRow))
const runOption = computed(() => buildChartOption('run', props.runRow))
const chartStyle = computed(() => ({
  width: props.width || '100%'
}))
</script>

<template>
  <section class="report-vendor-cost">
    <h3>{{ props.vendorName }}</h3>

    <div class="report-vendor-cost-grid">
      <section class="report-vendor-cost-block">
        <h4>Projekt</h4>
        <div v-if="projectHasData" class="report-vendor-cost-chart" :style="chartStyle">
          <ClientOnly>
            <VChart
              v-if="isVisible"
              :option="projectOption"
              :init-options="initOptions"
              autoresize
            />
          </ClientOnly>
        </div>
        <p v-else class="report-empty-state">
          Es wurden noch keine Projektkosten für diesen Anbieter erfasst.
        </p>
        <ReportMarkdownBlock
          v-if="props.projectAssessment.trim()"
          :markdown="props.projectAssessment"
          class="report-vendor-cost-note"
        />
        <p v-else class="report-vendor-cost-note">Erklärungstext folgt.</p>
      </section>

      <section class="report-vendor-cost-block">
        <h4>Run</h4>
        <div v-if="runHasData" class="report-vendor-cost-chart" :style="chartStyle">
          <ClientOnly>
            <VChart
              v-if="isVisible"
              :option="runOption"
              :init-options="initOptions"
              autoresize
            />
          </ClientOnly>
        </div>
        <p v-else class="report-empty-state">
          Es wurden noch keine Run-Kosten für diesen Anbieter erfasst.
        </p>
        <ReportMarkdownBlock
          v-if="props.runAssessment.trim()"
          :markdown="props.runAssessment"
          class="report-vendor-cost-note"
        />
        <p v-else class="report-vendor-cost-note">Erklärungstext folgt.</p>
      </section>
    </div>

    <p class="report-vendor-cost-meta">
      Run-Kosten werden über {{ props.considerationYears }} Jahre betrachtet.
    </p>
  </section>
</template>

<style scoped>
.report-vendor-cost {
  break-inside: avoid;
  display: flex;
  flex-direction: column;
  gap: 4mm;
}

.report-vendor-cost h3 {
  color: #111827;
  font-size: 15pt;
  font-weight: 750;
  margin: 0;
}

.report-vendor-cost-grid {
  display: flex;
  flex-direction: column;
  gap: 6mm;
}

.report-vendor-cost-block {
  break-inside: avoid;
  display: flex;
  flex-direction: column;
  gap: 2.5mm;
}

.report-vendor-cost-block h4 {
  color: #111827;
  font-size: 11pt;
  font-weight: 700;
  margin: 0;
}

.report-vendor-cost-chart {
  height: 84mm;
  max-width: 100%;
  overflow: hidden;
}

.report-vendor-cost-note,
.report-vendor-cost-meta {
  color: #4b5563;
  font-size: 9.5pt;
  line-height: 1.45;
  margin: 0;
}

.report-vendor-cost-meta {
  color: #6b7280;
  font-size: 9pt;
}

.report-empty-state {
  align-items: center;
  background: #f9fafb;
  color: #6b7280;
  display: flex;
  font-size: 9.5pt;
  font-style: italic;
  justify-content: center;
  min-height: 48mm;
  text-align: center;
}
</style>
