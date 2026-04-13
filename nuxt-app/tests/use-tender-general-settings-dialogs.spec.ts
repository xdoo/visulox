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
    const state = runInScope(() => useTenderGeneralSettingsDialogs(() => [0, 10], () => 10))

    state.openScoreModal()

    expect(state.isScoreModalOpen.value).toBe(true)
    expect(state.editingScoreRange.value).toEqual([0, 10])
  })

  it('opens the palette modal with the selected row values', () => {
    const state = runInScope(() => useTenderGeneralSettingsDialogs(() => [0, 10], () => 10))

    state.openPaletteModal({
      index: 2,
      color: '#0D57A6'
    })

    expect(state.isColorModalOpen.value).toBe(true)
    expect(state.editingPaletteIndex.value).toBe(2)
    expect(state.editingPaletteColor.value).toBe('#0D57A6')
  })

  it('opens the consideration years modal with the current value', () => {
    const state = runInScope(() => useTenderGeneralSettingsDialogs(() => [0, 10], () => 12))

    state.openConsiderationYearsModal()

    expect(state.isConsiderationYearsModalOpen.value).toBe(true)
    expect(state.editingConsiderationYears.value).toBe(12)
  })
})
