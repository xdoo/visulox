<script setup lang="ts">
import type {
  DefaultLabelFormatterCallbackParams,
  EChartsOption,
  TooltipComponentFormatterCallbackParams
} from 'echarts'
import { defaultTenderChartPalette } from '../../../shared/constants/tender-settings'

interface SectionScore {
  sectionId: string
  sectionName: string
  weight: number
  fulfillment: number
  contribution: number
}

interface VendorScore {
  vendorId: string
  vendorName: string
  totalScore: number
  sectionScores: SectionScore[]
}

const props = defineProps<{
  scores: VendorScore[]
  palette?: string[]
}>()

const isVisible = ref(false)

onMounted(() => {
  nextTick(() => {
    isVisible.value = true
  })
})

const chartPalette = computed(() => props.palette || defaultTenderChartPalette)

function toTooltipParams(params: TooltipComponentFormatterCallbackParams) {
  return Array.isArray(params) ? params : [params]
}

// Sort vendors by total score descending
const sortedScores = computed(() => {
  return [...props.scores].sort((a, b) => b.totalScore - a.totalScore)
})

const option = computed<EChartsOption>(() => {
  const vendorNames = sortedScores.value.map(s => s.vendorName)
  const sections = sortedScores.value[0]?.sectionScores.map(ss => ({
    id: ss.sectionId,
    name: ss.sectionName
  })) || []

  const series: any[] = [
    {
      name: 'Max',
      type: 'bar',
      barGap: '-100%',
      z: 1,
      silent: true,
      itemStyle: {
        color: 'rgba(108, 159, 203, 0.1)',
        borderRadius: 4
      },
      data: vendorNames.map(() => 100)
    }
  ]

  // Add one series per section
  sections.forEach((section, index) => {
    const sectionSeries: any = {
      name: section.name,
      type: 'bar',
      stack: 'total',
      z: 2,
      itemStyle: {
        color: chartPalette.value[index % chartPalette.value.length],
        borderRadius: index === 0 ? [4, 0, 0, 4] : (index === sections.length - 1 ? [0, 4, 4, 0] : 0)
      },
      label: {
        show: true,
        position: 'insideRight',
        align: 'right',
        distance: 0,
        padding: [0, 4, 0, 4],
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'normal',
        textBorderColor: 'rgba(32, 32, 32, 0.4)',
        textBorderWidth: 2,
        formatter: (params: any) => {
          const fulfillment = params.data?.meta?.fulfillment

          if (typeof fulfillment !== 'number' || fulfillment < 20) {
            return ''
          }

          return `${Math.round(fulfillment)}%`
        }
      },
      labelLayout: {
        hideOverlap: false
      },
      // Data must be in the same order as vendorNames
      data: sortedScores.value.map(vs => {
        const ss = vs.sectionScores.find(s => s.sectionId === section.id)
        return {
          value: ss?.contribution || 0,
          meta: ss // keep full info for tooltip
        }
      })
    }

    series.push(sectionSeries)
  })

  series.push({
    name: 'Gesamt',
    type: 'bar',
    stack: 'total',
    z: 3,
    silent: true,
    itemStyle: {
      color: 'transparent'
    },
    emphasis: {
      disabled: true
    },
    tooltip: {
      show: false
    },
    label: {
      show: true,
      position: 'right',
      distance: 8,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#111111',
      formatter: (params: any) => `${Math.round(params.data.totalScore)}%`
    },
    data: sortedScores.value.map((vendor) => ({
      value: 0,
      totalScore: vendor.totalScore
    }))
  })

  return {
    grid: {
      left: 20,
      right: 60,
      top: 40,
      bottom: 20,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: TooltipComponentFormatterCallbackParams) => {
        const tooltipParams = toTooltipParams(params)
        const firstParam = tooltipParams[0]

        if (!firstParam) {
          return ''
        }

        const vendorIndex = firstParam.dataIndex
        const vendor = sortedScores.value[vendorIndex]

        if (!vendor) {
          return ''
        }

        let result = `<div class="font-sans p-1">`
        result += `<div class="font-bold mb-2 border-b pb-1 text-lg">${vendor.vendorName}</div>`

        tooltipParams.forEach((p: DefaultLabelFormatterCallbackParams) => {
          if (p.seriesName === 'Max') return
          
          const ss = (p.data as { meta?: SectionScore } | undefined)?.meta
          if (!ss) return

          result += `
            <div class="mb-3 last:mb-0">
              <div class="flex items-center gap-2 font-semibold">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${p.color};"></span>
                ${p.seriesName}
              </div>
              <div class="pl-4 text-sm grid grid-cols-2 gap-x-4">
                <span class="text-gray-500">Gewicht:</span> <b>${Math.round(ss.weight)}%</b>
                <span class="text-gray-500">Erfüllung:</span> <b>${Math.round(ss.fulfillment)}%</b>
                <span class="text-gray-500 font-medium">Beitrag:</span> <b class="text-primary-600">${ss.contribution.toFixed(1)}%</b>
              </div>
            </div>
          `
        })

        result += `
          <div class="mt-2 pt-2 border-t flex justify-between items-center font-bold text-lg">
            <span>Gesamt:</span>
            <span class="text-primary-700">${vendor.totalScore.toFixed(1)}%</span>
          </div>
        `
        result += `</div>`
        return result
      }
    },
    legend: {
      show: true,
      top: 0,
      type: 'scroll',
      itemWidth: 10,
      itemHeight: 10,
      data: sections.map(section => section.name)
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 105,
      splitLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: vendorNames,
      inverse: true,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'var(--ui-text-muted)'
      }
    },
    series
  }
})
</script>

<template>
  <div class="h-[400px] w-full overflow-hidden">
    <ClientOnly>
      <VChart v-if="isVisible" :option="option" autoresize />
    </ClientOnly>
  </div>
</template>
