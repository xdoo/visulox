import { ref } from 'vue'

export interface PaletteDialogRow {
  color: string
  index: number
}

export function useTenderGeneralSettingsDialogs(scoreRange: () => [number, number]) {
  const isScoreModalOpen = ref(false)
  const editingScoreRange = ref<[number, number]>([...scoreRange()] as [number, number])
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
    isColorModalOpen,
    editingPaletteIndex,
    editingPaletteColor,
    openScoreModal,
    closeScoreModal,
    openPaletteModal,
    closePaletteModal
  }
}
