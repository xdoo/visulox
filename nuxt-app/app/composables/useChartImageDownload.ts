import { ref } from 'vue'

interface EChartLikeInstance {
  getDataURL(options?: {
    type?: 'png' | 'jpeg' | 'svg'
    pixelRatio?: number
    backgroundColor?: string
  }): string
}

interface VChartLikeRef {
  chart?: EChartLikeInstance
  getEchartsInstance?: () => EChartLikeInstance
}

export function useChartImageDownload() {
  const chartRef = ref<VChartLikeRef | null>(null)

  function downloadPng(filename: string) {
    downloadImage(filename, 'png')
  }

  function downloadSvg(filename: string) {
    downloadImage(filename, 'svg')
  }

  function downloadImage(filename: string, type: 'png' | 'svg') {
    const instance = chartRef.value?.getEchartsInstance?.() || chartRef.value?.chart

    if (!instance) {
      return
    }

    const url = instance.getDataURL({
      type,
      pixelRatio: type === 'png' ? 2 : 1,
      backgroundColor: '#ffffff'
    })

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  return {
    chartRef,
    downloadPng,
    downloadSvg
  }
}
