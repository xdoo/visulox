import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'

import { useCategoryResultAssessmentEditor } from '../app/composables/useCategoryResultAssessmentEditor'

const runMutationMock = vi.fn()
const clearErrorMock = vi.fn()
const fetchMock = vi.fn()

vi.mock('../app/composables/useTenderSettingsMutation', () => ({
  useTenderSettingsMutation: () => ({
    errorMessage: ref(''),
    runMutation: runMutationMock,
    clearError: clearErrorMock
  })
}))

vi.stubGlobal('$fetch', fetchMock)

function runInScope<T>(factory: () => T) {
  let result!: T

  effectScope().run(() => {
    result = factory()
  })

  return result
}

describe('useCategoryResultAssessmentEditor', () => {
  beforeEach(() => {
    runMutationMock.mockReset()
    clearErrorMock.mockReset()
    fetchMock.mockReset()
    runMutationMock.mockImplementation(async (action: () => Promise<unknown>) => await action())
  })

  it('opens a category with the saved assessment and persists trimmed markdown', async () => {
    const state = runInScope(() => useCategoryResultAssessmentEditor('7'))

    state.openResultAssessmentEditor({
      id: '21',
      name: 'Qualitaet',
      weight: 60,
      evaluators: '',
      description: '',
      resultAssessment: 'Alt',
      questionsByVendor: []
    })
    state.resultAssessment.value = '  ## Neu  '

    expect(state.canSaveResultAssessment.value).toBe(true)

    await state.saveResultAssessment()

    expect(fetchMock).toHaveBeenCalledWith('/api/sections/21/result-assessment', {
      method: 'PATCH',
      body: {
        resultAssessment: '## Neu'
      }
    })
    expect(state.isResultAssessmentModalOpen.value).toBe(false)
  })
})
