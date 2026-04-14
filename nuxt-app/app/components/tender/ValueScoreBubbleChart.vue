<script setup lang="ts">
import type {
  EChartsOption,
  TooltipComponentFormatterCallbackParams
} from 'echarts'
import { defaultTenderChartPalette } from '../../../shared/constants/tender-settings'
import { useChartImageDownload } from '../../composables/useChartImageDownload'
import {
  buildTenderValueBubblePoints,
  calculateBubbleSize,
  getBubbleScoreRange
} from '../../composables/useTenderValueScore'

import type { TenderValueScoreRow } from '../../composables/useTenderValueScore'

const props = defineProps<{
  rows: TenderValueScoreRow[]
  palette?: typeof defaultTenderChartPalette
}>()

const isVisible = ref(false)
const { chartRef, downloadPng, downloadSvg } = useChartImageDownload()

onMounted(() => {
  nextTick(() => {
    isVisible.value = true
  })
})

const chartPalette = computed(() => props.palette || defaultTenderChartPalette)
const points = computed(() => buildTenderValueBubblePoints(props.rows))
const scoreRange = computed(() => getBubbleScoreRange(points.value))

function toTooltipParams(params: TooltipComponentFormatterCallbackParams) {
  return Array.isArray(params) ? params[0] : params
}

const option = computed<EChartsOption>(() => ({
  grid: {
    left: 80,
    right: 40,
    top: 32,
    bottom: 56
  },
  tooltip: {
    trigger: 'item',
    formatter: (params: TooltipComponentFormatterCallbackParams) => {
      const point = toTooltipParams(params)
      const data = Array.isArray(point.data) ? point.data : null

      if (!data) {
        return ''
      }

      return [
        `<b>${data[3]}</b>`,
        `Nutzen: ${Math.round(Number(data[1]) * 100)}%`,
        `Kosten normiert: ${Number(data[0]).toFixed(2)}`,
        `Score: ${Number(data[2]).toFixed(2)}`
      ].join('<br/>')
    }
  },
  xAxis: {
    type: 'value',
    name: 'Kosten normiert (rechts = besser)',
    min: 0,
    max: 1,
    splitLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.18)'
      }
    },
    axisLabel: {
      formatter: (value: number) => value.toFixed(2)
    }
  },
  yAxis: {
    type: 'value',
    name: 'Nutzen',
    min: 0,
    max: 1,
    splitLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.18)'
      }
    },
    axisLabel: {
      formatter: (value: number) => `${Math.round(value * 100)}%`
    }
  },
  series: [
    {
      type: 'scatter',
      data: points.value.map((point) => ({
        value: point.value,
        itemStyle: {
          color: chartPalette.value[0]?.fillColor || defaultTenderChartPalette[0].fillColor,
          opacity: 0.85
        }
      })),
      label: {
        show: true,
        position: 'top',
        formatter: (params: { data?: { value?: [number, number, number, string] } }) => params.data?.value?.[3] || '',
        color: 'var(--ui-text)'
      },
      symbolSize: (data: [number, number, number, string]) => {
        const range = scoreRange.value

        return range
          ? calculateBubbleSize(data[2], range.min, range.max, 40, 80)
          : 40
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
  <div class="h-[460px] w-full overflow-hidden">
    <ClientOnly>
      <VChart
        v-if="isVisible"
        ref="chartRef"
        :option="option"
        autoresize
      />
    </ClientOnly>
  </div>
</template>
