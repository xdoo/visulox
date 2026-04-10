import { computed, ref, watch } from 'vue'

import { useTenderGeneralSettingsMutations } from './useTenderGeneralSettingsMutations'

import type { TenderSettings } from '../../shared/types/tenders'

export function normalizePaletteColor(value: string) {
  const normalizedValue = value.trim()
  return normalizedValue.startsWith('#') ? normalizedValue.toUpperCase() : `#${normalizedValue.toUpperCase()}`
}

export function useTenderGeneralSettings(tenderId: string, settings: () => TenderSettings) {
  const { errorMessage, updateTenderSettings, clearError } = useTenderGeneralSettingsMutations(tenderId)
  const scoreRange = ref<[number, number]>([...settings().scoreRange] as [number, number])
  const chartPalette = ref<string[]>([...settings().chartPalette])
  const isSaving = ref(false)

  watch(settings, (nextSettings) => {
    scoreRange.value = [...nextSettings.scoreRange] as [number, number]
    chartPalette.value = [...nextSettings.chartPalette]
  }, { immediate: true, deep: true })

  const normalizedSettings = computed<TenderSettings>(() => ({
    scoreRange: [...scoreRange.value] as [number, number],
    chartPalette: chartPalette.value.map(normalizePaletteColor)
  }))

  const canSave = computed(() => {
    const [scoreMin, scoreMax] = normalizedSettings.value.scoreRange

    if (scoreMin >= scoreMax) {
      return false
    }

    return normalizedSettings.value.chartPalette.length > 0
      && normalizedSettings.value.chartPalette.every(color => /^#(?:[0-9A-F]{6})$/.test(color))
  })

  function updatePaletteColor(index: number, value: string) {
    chartPalette.value[index] = value
  }

  function addPaletteColor() {
    chartPalette.value.push('#000000')
  }

  function removePaletteColor(index: number) {
    chartPalette.value.splice(index, 1)
  }

  async function save() {
    if (!canSave.value) {
      return
    }

    isSaving.value = true
    clearError()

    try {
      await updateTenderSettings(normalizedSettings.value)
    } finally {
      isSaving.value = false
    }
  }

  return {
    errorMessage,
    scoreRange,
    chartPalette,
    isSaving,
    canSave,
    updatePaletteColor,
    addPaletteColor,
    removePaletteColor,
    save
  }
}
