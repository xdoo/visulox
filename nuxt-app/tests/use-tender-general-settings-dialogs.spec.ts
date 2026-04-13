import { describe, expect, it } from 'vitest'
import { effectScope } from 'vue'

import { useTenderGeneralSettingsDialogs } from '../app/composables/useTenderGeneralSettingsDialogs'

function runInScope<T>(factory: () => T) {
  let result!: T

  effectScope().run(() => {
    result = factory()
  })

  return result
}

describe('useTenderGeneralSettingsDialogs', () => {
  it('opens the score modal with the current score range', () => {
    const state = runInScope(() => useTenderGeneralSettingsDialogs(() => [0, 10], () => 10, () => 1))

    state.openScoreModal()

    expect(state.isScoreModalOpen.value).toBe(true)
    expect(state.editingScoreRange.value).toEqual([0, 10])
  })

  it('opens the palette modal with the selected row values', () => {
    const state = runInScope(() => useTenderGeneralSettingsDialogs(() => [0, 10], () => 10, () => 1))

    state.openPaletteModal({
      index: 2,
      fillColor: '#0D57A6',
      textColor: '#FFFFFF'
    })

    expect(state.isColorModalOpen.value).toBe(true)
    expect(state.editingPaletteIndex.value).toBe(2)
    expect(state.editingPaletteFillColor.value).toBe('#0D57A6')
    expect(state.editingPaletteTextColor.value).toBe('#FFFFFF')
  })

  it('opens the palette create modal with default values', () => {
    const state = runInScope(() => useTenderGeneralSettingsDialogs(() => [0, 10], () => 10, () => 0))

    state.openCreatePaletteModal()

    expect(state.isColorModalOpen.value).toBe(true)
    expect(state.editingPaletteIndex.value).toBeNull()
    expect(state.editingPaletteFillColor.value).toBe('#0D57A6')
    expect(state.editingPaletteTextColor.value).toBe('#FFFFFF')
  })

  it('opens the consideration years modal with the current value', () => {
    const state = runInScope(() => useTenderGeneralSettingsDialogs(() => [0, 10], () => 12, () => 1))

    state.openConsiderationYearsModal()

    expect(state.isConsiderationYearsModalOpen.value).toBe(true)
    expect(state.editingConsiderationYears.value).toBe(12)
  })
})
