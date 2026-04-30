<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { defaultTenderChartPalette } from '~~/shared/constants/tender-settings'
import { formatCostChartMillionValue, formatCostChartValue } from '../../composables/useTenderCostOverview'
import { parseVendorCostAmount } from '../../composables/useTenderVendorCosts'
import type { VendorCostRow } from '../../composables/useTenderVendorCosts'

interface DonutSegment {
  id: string
  name: string
  value: number
  color: string
}

const props = defineProps<{
  title: string
  kind: 'project' | 'run'
  rows: VendorCostRow[]
  considerationYears: number
  palette?: typeof defaultTenderChartPalette
  renderer?: 'canvas' | 'svg'
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
const MIN_VISIBLE_LABEL_PERCENT = 4
const legendRowCount = computed(() => Math.max(1, Math.ceil(segments.value.length / 2)))
const legendBottomSpace = computed(() => 20 + (legendRowCount.value * 22))

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

const segments = computed<DonutSegment[]>(() => {
  return props.rows
    .map((row, index) => {
      const annualAmount = parseVendorCostAmount(row.amount)

      if (annualAmount === null || Number.isNaN(annualAmount) || annualAmount <= 0) {
        return null
      }

      const value = props.kind === 'run'
        ? annualAmount * props.considerationYears
        : annualAmount

      return {
        id: row.costBlockId,
        name: row.name,
        value: Number(value.toFixed(2)),
        color: getPaletteEntry(index).fillColor
      }
    })
    .filter((segment): segment is DonutSegment => segment !== null)
})

const total = computed(() => {
  return Number(segments.value.reduce((sum, segment) => sum + segment.value, 0).toFixed(2))
})

function shouldShowSegmentLabel(value: number) {
  if (!Number.isFinite(value) || value <= 0 || total.value <= 0) {
    return false
  }

  const percentage = (value / total.value) * 100
  return percentage >= MIN_VISIBLE_LABEL_PERCENT
}

const option = computed<EChartsOption>(() => ({
  title: {
    text: `${formatCostChartMillionValue(total.value)} €`,
    subtext: props.kind === 'run' ? `${props.considerationYears} Jahre` : '',
    left: '50%',
    top: '38%',
    textAlign: 'center',
    textVerticalAlign: 'middle',
    itemGap: 3,
    textStyle: {
      color: '#111827',
      fontSize: 13,
      fontWeight: 700
    },
    subtextStyle: {
      color: '#6b7280',
      fontSize: 10
    }
  },
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
    data: segments.value.map((segment) => segment.name)
  },
  grid: {
    left: 0,
    right: 0,
    top: 0,
    bottom: legendBottomSpace.value
  },
  series: [
    {
      type: 'pie',
      radius: [72, 116],
      center: ['50%', '42%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'outside',
        alignTo: 'none',
        distanceToLabelLine: 2,
        bleedMargin: 2,
        formatter: (params: any) => {
          const value = Number(params?.value || 0)
          const share = Number(params?.percent || 0)

          if (!Number.isFinite(value) || !Number.isFinite(share) || share < MIN_VISIBLE_LABEL_PERCENT) {
            return ''
          }

          return `${formatCostChartMillionValue(value)} €\n${share.toFixed(1)}%`
        },
        fontSize: 10,
        lineHeight: 14,
        color: '#374151'
      },
      labelLine: {
        show: true,
        length: 12,
        length2: 10,
        lineStyle: {
          color: '#9ca3af'
        }
      },
      labelLayout: {
        hideOverlap: true,
        moveOverlap: 'shiftY'
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2
      },
      data: segments.value.map((segment) => ({
        value: segment.value,
        name: segment.name,
        label: {
          show: shouldShowSegmentLabel(segment.value)
        },
        labelLine: {
          show: shouldShowSegmentLabel(segment.value)
        },
        itemStyle: {
          color: segment.color
        }
      }))
    }
  ]
}))
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <h3 class="font-semibold">{{ props.title }}</h3>
          <p class="text-sm ui-text-muted">
            {{ props.kind === 'run' ? `Werte über ${props.considerationYears} Jahre.` : 'Einmalkosten im Projektzeitraum.' }}
          </p>
        </div>

        <div class="shrink-0">
          <slot name="header-actions" />
        </div>
      </div>
    </template>

    <div v-if="segments.length === 0" class="flex h-[280px] items-center justify-center text-sm italic ui-text-muted">
      Keine Kostenwerte für diese Darstellung vorhanden.
    </div>

    <div v-else>
      <div :style="{ height: `${Math.max(380, 320 + legendBottomSpace)}px` }">
        <ClientOnly>
          <VChart
            v-if="isVisible"
            :option="option"
            :init-options="initOptions"
            autoresize
          />
        </ClientOnly>
      </div>
    </div>
  </UCard>
</template>
