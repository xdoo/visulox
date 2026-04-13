<script setup lang="ts">
import type {
  DefaultLabelFormatterCallbackParams,
  EChartsOption,
  TooltipComponentFormatterCallbackParams
} from 'echarts'
import { defaultTenderChartPalette } from '../../../shared/constants/tender-settings'
import {
  formatCostChartMillionValue,
  formatCostChartValue
} from '../../composables/useTenderCostOverview'
import { useChartImageDownload } from '../../composables/useChartImageDownload'
import type {
  VendorCostOverviewRow,
  VendorCostOverviewRowKind
} from '../../composables/useTenderCostOverview'

interface ChartDataPoint {
  value: number
  meta: {
    row: VendorCostOverviewRow
    segmentName: string
    annualValue: number
  } | null
  total?: number
}

const props = defineProps<{
  kind: VendorCostOverviewRowKind
  rows: VendorCostOverviewRow[]
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

function toTooltipParams(params: TooltipComponentFormatterCallbackParams) {
  return Array.isArray(params) ? params : [params]
}

const option = computed<EChartsOption>(() => {
  const categories = props.rows.map((row) => row.vendorName)
  const costBlockOrder = Array.from(new Map(
    props.rows.flatMap((row) => row.segments.map((segment) => [segment.costBlockId, segment]))
  ).values())

  const maxTotal = Math.max(...props.rows.map((row) => row.total), 0)
  const chartMax = maxTotal > 0 ? maxTotal * 1.1 : 1

  const series: EChartsOption['series'] = []

  costBlockOrder.forEach((costBlock, index) => {
    series?.push({
      name: costBlock.name,
      type: 'bar',
      stack: 'total',
      z: 2,
      itemStyle: {
        color: chartPalette.value[index % chartPalette.value.length].fillColor,
        borderRadius: index === 0 ? [4, 0, 0, 4] : (index === costBlockOrder.length - 1 ? [0, 4, 4, 0] : 0)
      },
      label: {
        show: true,
        position: 'insideRight',
        align: 'right',
        padding: [0, 4, 0, 4],
        color: chartPalette.value[index % chartPalette.value.length].textColor,
        fontSize: 11,
        fontWeight: 'normal',
        formatter: (params: DefaultLabelFormatterCallbackParams) => {
          const value = typeof params.value === 'number' ? params.value : Number(params.value)

          if (!Number.isFinite(value) || value <= 0) {
            return ''
          }

          return value < chartMax * 0.08 ? '' : formatCostChartMillionValue(value)
        }
      },
      labelLayout: {
        hideOverlap: false
      },
      data: props.rows.map<ChartDataPoint>((row) => {
        const segment = row.segments.find((entry) => entry.costBlockId === costBlock.costBlockId)

        return {
          value: segment?.value || 0,
          meta: segment
            ? {
                row,
                segmentName: segment.name,
                annualValue: segment.annualValue
              }
            : null
        }
      })
    })
  })

  series?.push({
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
      formatter: (params: DefaultLabelFormatterCallbackParams) => {
        const total = (params.data as ChartDataPoint | undefined)?.total
        return typeof total === 'number' ? `${formatCostChartMillionValue(total)} €` : ''
      }
    },
    data: props.rows.map<ChartDataPoint>((row) => ({
      value: 0,
      meta: null,
      total: row.total
    }))
  })

  return {
    grid: {
      left: 20,
      right: 140,
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

        const row = props.rows[firstParam.dataIndex]

        if (!row) {
          return ''
        }

        let result = `<div class="font-sans p-1">`
        result += `<div class="font-bold mb-2 border-b pb-1 text-lg">${row.vendorName} · ${props.kind === 'project' ? 'Projekt' : props.kind === 'run' ? 'Run' : 'Gesamt'}</div>`

        if (props.kind !== 'project') {
          result += `
            <div class="mb-2 text-sm">
              <div class="flex justify-between gap-4"><span>Jährliche Summe:</span><b>${formatCostChartMillionValue(row.annualTotal)} €</b></div>
              <div class="flex justify-between gap-4"><span>Betrachtungszeitraum:</span><b>${row.considerationYears} Jahre</b></div>
            </div>
          `
        }

        tooltipParams.forEach((param: DefaultLabelFormatterCallbackParams) => {
          if (param.seriesName === 'Gesamt') {
            return
          }

          const meta = (param.data as ChartDataPoint | undefined)?.meta

          if (!meta) {
            return
          }

          result += `
            <div class="mb-3 last:mb-0">
              <div class="flex items-center gap-2 font-semibold">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};"></span>
                ${meta.segmentName}
              </div>
              <div class="pl-4 text-sm grid grid-cols-2 gap-x-4">
                <span class="text-gray-500">Wert:</span> <b>${formatCostChartMillionValue(props.kind === 'project' ? (typeof param.value === 'number' ? param.value : Number(param.value)) : meta.annualValue)} €${props.kind === 'project' ? '' : ' / Jahr'}</b>
                ${props.kind !== 'project'
                  ? `<span class="text-gray-500">Über ${meta.row.considerationYears} Jahre:</span> <b>${formatCostChartMillionValue(typeof param.value === 'number' ? param.value : Number(param.value))} €</b>`
                  : ''}
              </div>
            </div>
          `
        })

        result += `
          <div class="mt-2 pt-2 border-t flex justify-between items-center font-bold text-lg">
            <span>Gesamt:</span>
            <span>${formatCostChartMillionValue(row.total)} €</span>
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
      data: costBlockOrder.map((costBlock) => costBlock.name)
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: chartMax,
      splitLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: categories,
      inverse: true,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: 'var(--ui-text-muted)'
      }
    },
    series
  }
})

defineExpose({
  downloadPng,
  downloadSvg
})
</script>

<template>
  <div class="h-[420px] w-full overflow-hidden">
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
