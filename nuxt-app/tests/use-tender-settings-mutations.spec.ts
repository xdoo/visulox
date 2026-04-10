import { describe, expect, it, vi, beforeEach } from 'vitest'
import { effectScope, ref } from 'vue'

import { useTenderSectionMutations } from '../app/composables/useTenderSectionMutations'
import { useTenderVendorMutations } from '../app/composables/useTenderVendorMutations'

const runMutationMock = vi.fn()
const clearErrorMock = vi.fn()

vi.mock('../app/composables/useTenderSettingsMutation', () => ({
  useTenderSettingsMutation: () => ({
    errorMessage: ref(''),
    runMutation: runMutationMock,
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

describe('tender settings mutation composables', () => {
  beforeEach(() => {
    runMutationMock.mockReset()
    clearErrorMock.mockReset()
  })

  it('exposes section mutations that delegate through the shared runner', async () => {
    runMutationMock.mockImplementation(async (action: () => Promise<unknown>) => {
      return await action()
    })
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({}))

    const state = runInScope(() => useTenderSectionMutations('7'))

    await state.addSection({ name: 'Qualitaet', weight: 60 })
    await state.updateSection('1', { name: 'Qualitaet', weight: 60 })
    await state.deleteSection('1')

    expect(runMutationMock).toHaveBeenCalledTimes(3)
  })

  it('exposes vendor mutations that delegate through the shared runner', async () => {
    runMutationMock.mockImplementation(async (action: () => Promise<unknown>) => {
      return await action()
    })
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({}))

    const state = runInScope(() => useTenderVendorMutations('7'))

    await state.addVendor({ name: 'Acme' })
    await state.updateVendor('1', { name: 'Acme Europe' })
    await state.deleteVendor('1')

    expect(runMutationMock).toHaveBeenCalledTimes(3)
  })
})
