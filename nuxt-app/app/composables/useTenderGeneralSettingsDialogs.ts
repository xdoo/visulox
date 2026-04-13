import { ref } from 'vue'

export interface PaletteDialogRow {
  color: string
  index: number
}

export function useTenderGeneralSettingsDialogs(scoreRange: () => [number, number], considerationYears: () => number) {
  const isScoreModalOpen = ref(false)
  const editingScoreRange = ref<[number, number]>([...scoreRange()] as [number, number])
  const isConsiderationYearsModalOpen = ref(false)
  const editingConsiderationYears = ref(considerationYears())
  const isColorModalOpen = ref(false)
  const editingPaletteIndex = ref<number | null>(null)
  const editingPaletteColor = ref('')

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
    editingPaletteColor.value = row.color
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
    editingPaletteColor,
    openScoreModal,
    closeScoreModal,
    openConsiderationYearsModal,
    closeConsiderationYearsModal,
    openPaletteModal,
    closePaletteModal
  }
}
