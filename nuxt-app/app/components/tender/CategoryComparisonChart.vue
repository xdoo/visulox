<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { defaultTenderChartPalette } from '~~/shared/constants/tender-settings'
import { useChartImageDownload } from '../../composables/useChartImageDownload'
import type { SectionVendorComparisonRow } from '../../composables/useTenderCategoryComparison'

const props = defineProps<{
  row: SectionVendorComparisonRow
  palette?: typeof defaultTenderChartPalette
  renderer?: 'canvas' | 'svg'
  width?: string
}>()

const isVisible = ref(false)
const { chartRef, downloadPng, downloadSvg } = useChartImageDownload()

onMounted(() => {
  nextTick(() => {
    isVisible.value = true
  })
})

const chartPalette = computed(() => props.palette || defaultTenderChartPalette)
const bestVendorColor = computed(() => chartPalette.value[0]?.fillColor ?? '#0D57A6')
const initOptions = computed(() => ({
  renderer: props.renderer || 'canvas'
}))
const chartStyle = computed(() => ({
  width: props.width || '100%'
}))

const option = computed<EChartsOption>(() => ({
  title: {
    text: `${props.row.sectionName} (Gewicht ${Math.round(props.row.sectionWeight)}%)`,
    left: 0,
    top: 0,
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#111827'
    }
  },
  grid: {
    left: 20,
    right: 20,
    top: 42,
    bottom: 20,
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any) => {
      const point = Array.isArray(params) ? params[0] : params
      const data = point?.data

      if (!data) {
        return ''
      }

      return `
        <div class="font-sans p-1">
          <div class="font-bold mb-1 border-b pb-1">${data.vendorName}</div>
          <div class="flex justify-between gap-4"><span>Kategorie:</span> <b>${props.row.sectionName}</b></div>
          <div class="flex justify-between gap-4"><span>Gewicht:</span> <b>${Math.round(props.row.sectionWeight)}%</b></div>
          <div class="flex justify-between gap-4 border-t mt-1 pt-1"><span>Erfüllung:</span> <b>${Math.round(data.fulfillment)}%</b></div>
        </div>
      `
    }
  },
  xAxis: {
    type: 'value',
    min: 0,
    max: 100,
    splitLine: { show: false },
    axisLabel: {
      formatter: (value: number) => `${Math.round(value)}%`
    }
  },
  yAxis: {
    type: 'category',
    data: props.row.vendors.map((vendor) => vendor.vendorName),
    inverse: false,
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      fontSize: 13,
      fontWeight: 'bold',
      color: 'var(--ui-text-muted)'
    }
  },
  series: [
    {
      type: 'bar',
      z: 2,
      data: props.row.vendors.map((vendor) => ({
        value: vendor.fulfillment,
        vendorName: vendor.vendorName,
        fulfillment: vendor.fulfillment,
        itemStyle: {
          color: vendor.isBest
            ? bestVendorColor.value
            : 'rgba(108, 159, 203, 0.35)',
          borderRadius: 4
        }
      })),
      label: {
        show: true,
        position: 'insideRight',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        formatter: (params: any) => {
          const value = Math.round(Number(params.value || 0))
          return value > 15 ? `${value}%` : ''
        }
      }
    }
  ]
}))

defineExpose({
  downloadPng,
  downloadSvg
})
</script>

<template>
  <div class="h-[320px] overflow-hidden" :style="chartStyle">
    <ClientOnly>
      <VChart
        v-if="isVisible"
        ref="chartRef"
        :option="option"
        :init-options="initOptions"
        autoresize
      />
    </ClientOnly>
  </div>
</template>
