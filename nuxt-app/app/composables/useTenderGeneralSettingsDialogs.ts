import { ref } from 'vue'
import { defaultTenderChartPalette } from '../../shared/constants/tender-settings'

export interface PaletteDialogRow {
  fillColor: string
  textColor: string
  index: number
}

export function useTenderGeneralSettingsDialogs(
  scoreRange: () => [number, number],
  considerationYears: () => number,
  chartPaletteLength: () => number
) {
  const isScoreModalOpen = ref(false)
  const editingScoreRange = ref<[number, number]>([...scoreRange()] as [number, number])
  const isConsiderationYearsModalOpen = ref(false)
  const editingConsiderationYears = ref(considerationYears())
  const isColorModalOpen = ref(false)
  const editingPaletteIndex = ref<number | null>(null)
  const editingPaletteFillColor = ref('')
  const editingPaletteTextColor = ref('#FFFFFF')

  function openScoreModal() {
    editingScoreRange.value = [...scoreRange()] as [number, number]
    isScoreModalOpen.value = true
  }

  function closeScoreModal() {
    isScoreModalOpen.value = false
  }

  function openConsiderationYearsModal() {
    editingConsiderationYears.value = considerationYears()
    isConsiderationYearsModalOpen.value = true
  }

  function closeConsiderationYearsModal() {
    isConsiderationYearsModalOpen.value = false
  }

  function openPaletteModal(row: PaletteDialogRow) {
    editingPaletteIndex.value = row.index
    editingPaletteFillColor.value = row.fillColor
    editingPaletteTextColor.value = row.textColor
    isColorModalOpen.value = true
  }

  function openCreatePaletteModal() {
    const defaultEntry = defaultTenderChartPalette[chartPaletteLength() % defaultTenderChartPalette.length]

    editingPaletteIndex.value = null
    editingPaletteFillColor.value = defaultEntry?.fillColor || '#0D57A6'
    editingPaletteTextColor.value = defaultEntry?.textColor || '#FFFFFF'
    isColorModalOpen.value = true
  }

  function closePaletteModal() {
    isColorModalOpen.value = false
  }

  return {
    isScoreModalOpen,
    editingScoreRange,
    isConsiderationYearsModalOpen,
    editingConsiderationYears,
    isColorModalOpen,
    editingPaletteIndex,
    editingPaletteFillColor,
    editingPaletteTextColor,
    openScoreModal,
    closeScoreModal,
    openConsiderationYearsModal,
    closeConsiderationYearsModal,
    openCreatePaletteModal,
    openPaletteModal,
    closePaletteModal
  }
}
