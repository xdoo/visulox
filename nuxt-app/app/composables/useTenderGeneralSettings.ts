import { computed, ref, watch } from 'vue'

import { useTenderGeneralSettingsMutations } from './useTenderGeneralSettingsMutations'

import type { TenderChartPaletteEntry, TenderSettings } from '../../shared/types/tenders'

export function normalizePaletteColor(value: string) {
  const normalizedValue = value.trim()
  return normalizedValue.startsWith('#') ? normalizedValue.toUpperCase() : `#${normalizedValue.toUpperCase()}`
}

export function normalizePaletteEntry(entry: TenderChartPaletteEntry): TenderChartPaletteEntry {
  return {
    fillColor: normalizePaletteColor(entry.fillColor),
    textColor: normalizePaletteColor(entry.textColor)
  }
}

export function useTenderGeneralSettings(tenderId: string, settings: () => TenderSettings) {
  const { errorMessage, updateTenderSettings, clearError } = useTenderGeneralSettingsMutations(tenderId)
  const scoreRange = ref<[number, number]>([...settings().scoreRange] as [number, number])
  const considerationYears = ref(settings().considerationYears)
  const chartPalette = ref<TenderChartPaletteEntry[]>(settings().chartPalette.map((entry) => ({ ...entry })))
  const isSaving = ref(false)

  watch(settings, (nextSettings) => {
    scoreRange.value = [...nextSettings.scoreRange] as [number, number]
    considerationYears.value = nextSettings.considerationYears
    chartPalette.value = nextSettings.chartPalette.map((entry) => ({ ...entry }))
  }, { immediate: true, deep: true })

  const normalizedSettings = computed<TenderSettings>(() => ({
    scoreRange: [...scoreRange.value] as [number, number],
    considerationYears: Number(considerationYears.value),
    chartPalette: chartPalette.value.map(normalizePaletteEntry)
  }))

  const canSave = computed(() => {
    const [scoreMin, scoreMax] = normalizedSettings.value.scoreRange

    if (scoreMin >= scoreMax) {
      return false
    }

    if (!Number.isFinite(normalizedSettings.value.considerationYears) || normalizedSettings.value.considerationYears < 1) {
      return false
    }

    return normalizedSettings.value.chartPalette.length > 0
      && normalizedSettings.value.chartPalette.every((entry) =>
        /^#(?:[0-9A-F]{6})$/.test(entry.fillColor) && /^#(?:[0-9A-F]{6})$/.test(entry.textColor)
      )
  })

  function updatePaletteColor(index: number, value: TenderChartPaletteEntry) {
    chartPalette.value[index] = value
  }

  function addPaletteColor(value: TenderChartPaletteEntry) {
    chartPalette.value.push(value)
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
    considerationYears,
    chartPalette,
    isSaving,
    canSave,
    updatePaletteColor,
    addPaletteColor,
    removePaletteColor,
    save
  }
}
