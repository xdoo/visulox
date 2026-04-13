import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'

import { normalizePaletteColor, useTenderGeneralSettings } from '../app/composables/useTenderGeneralSettings'

const updateTenderSettingsMock = vi.fn()
const clearErrorMock = vi.fn()

vi.mock('../app/composables/useTenderGeneralSettingsMutations', () => ({
  useTenderGeneralSettingsMutations: () => ({
    errorMessage: ref(''),
    updateTenderSettings: updateTenderSettingsMock,
    clearError: clearErrorMock
  })
}))

function runInScope<T>(factory: () => T) {
  let result!: T

  effectScope().run(() => {
    result = factory()
  })

  return result
}

describe('useTenderGeneralSettings', () => {
  beforeEach(() => {
    updateTenderSettingsMock.mockReset()
    clearErrorMock.mockReset()
  })

  it('normalizes palette values to uppercase hex colors', () => {
    expect(normalizePaletteColor('#0d57a6')).toBe('#0D57A6')
    expect(normalizePaletteColor('b47d00')).toBe('#B47D00')
  })

  it('saves score range and palette through the mutation composable', async () => {
    updateTenderSettingsMock.mockResolvedValue(undefined)

    const state = runInScope(() => useTenderGeneralSettings('7', () => ({
      scoreRange: [0, 10],
      considerationYears: 10,
      chartPalette: ['#0D57A6']
    })))

    state.scoreRange.value = [2, 18]
    state.considerationYears.value = 12
    state.updatePaletteColor(0, '#b47d00')
    state.addPaletteColor()
    state.updatePaletteColor(1, '083B73')

    await state.save()

    expect(updateTenderSettingsMock).toHaveBeenCalledWith({
      scoreRange: [2, 18],
      considerationYears: 12,
      chartPalette: ['#B47D00', '#083B73']
    })
  })
})
