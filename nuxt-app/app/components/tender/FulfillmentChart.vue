<script setup lang="ts">
import type { ECOption } from '#echarts'
import { useChartImageDownload } from '../../composables/useChartImageDownload'

interface ChartDataItem {
  name: string
  weight: number
  fulfillment: number
}

const props = defineProps<{
  data: ChartDataItem[]
}>()

const isVisible = ref(false)
const { chartRef, downloadPng, downloadSvg } = useChartImageDownload()

onMounted(() => {
  nextTick(() => {
    isVisible.value = true
  })
})

const option = computed<ECOption>(() => {
  const categories = props.data.map(d => d.name)
  const weightData = props.data.map(d => ({
    value: d.weight,
    weight: d.weight
  }))
  const fulfillmentData = props.data.map(d => ({
    // Beitrag = Gewicht * Erfüllung / 100
    value: (d.weight * d.fulfillment) / 100,
    weight: d.weight,
    fulfillment: d.fulfillment
  }))

  return {
    grid: {
      left: 20,
      right: 80,
      top: 20,
      bottom: 20,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = params[1] || params[0]
        const data = p.data
        const weight = Math.round(data.weight)
        const fulfillment = Math.round(data.fulfillment)
        const contribution = ((data.weight * data.fulfillment) / 100).toFixed(1)
        
        return `
          <div class="font-sans p-1">
            <div class="font-bold mb-1 border-b pb-1">${p.name}</div>
            <div class="flex justify-between gap-4"><span>Gewicht:</span> <b>${weight}%</b></div>
            <div class="flex justify-between gap-4"><span>Erfüllung:</span> <b>${fulfillment}%</b></div>
            <div class="flex justify-between gap-4 border-t mt-1 pt-1"><span>Beitrag:</span> <b>${contribution}%</b></div>
          </div>
        `
      }
    },
    xAxis: {
      type: 'value',
      max: (value: any) => value.max * 1.1,
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
        color: 'var(--ui-text-muted)',
        width: 250,
        overflow: 'break',
        lineHeight: 16,
        formatter: (value: string) => {
          const maxLen = 35
          const words = value.split(' ')
          let line = ''
          let result = ''

          for (let i = 0; i < words.length; i++) {
            if ((line + words[i]).length > maxLen) {
              result += line.trim() + '\n'
              line = words[i] + ' '
            } else {
              line += words[i] + ' '
            }
          }
          result += line.trim()

          return result.split('\n').slice(0, 3).join('\n')
        }
      }
    },
    series: [
      {
        name: 'Gewicht',
        type: 'bar',
        barGap: '-100%',
        z: 1,
        data: weightData,
        itemStyle: {
          color: 'rgba(108, 159, 203, 0.2)',
          borderRadius: 4
        },
        label: {
          show: true,
          position: 'right',
          align: 'left',
          distance: 10,
          fontSize: 14,
          fontWeight: 'bold',
          color: '#6C9FCB',
          formatter: (p: any) => `${Math.round(p.data.weight)}%`
        },
        silent: true
      },
      {
        name: 'Erfüllung',
        type: 'bar',
        z: 2,
        data: fulfillmentData,
        itemStyle: {
          color: '#0D57A6',
          borderRadius: 4
        },
        label: {
          show: true,
          position: 'insideRight',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          formatter: (p: any) => {
            const val = Math.round(p.data.fulfillment)
            return val > 15 ? `${val}%` : ''
          }
        }
      }
    ]
  }
})

defineExpose({
  downloadPng,
  downloadSvg
})
</script>

<template>
  <div class="h-[400px] w-full overflow-hidden">
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
