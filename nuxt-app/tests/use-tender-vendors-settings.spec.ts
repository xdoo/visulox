import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, effectScope, ref } from 'vue'

import { mapVendorsForSettings, useTenderVendorsSettings } from '../app/composables/useTenderVendorsSettings'

const addVendorMock = vi.fn()
const updateVendorMock = vi.fn()
const deleteVendorMock = vi.fn()
const clearErrorMock = vi.fn()

vi.mock('../app/composables/useTenderVendorMutations', () => ({
  useTenderVendorMutations: () => ({
    errorMessage: ref(''),
    addVendor: addVendorMock,
    updateVendor: updateVendorMock,
    deleteVendor: deleteVendorMock,
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

describe('useTenderVendorsSettings', () => {
  beforeEach(() => {
    addVendorMock.mockReset()
    updateVendorMock.mockReset()
    deleteVendorMock.mockReset()
    clearErrorMock.mockReset()
  })

  it('marks vendors as locked when imported questions exist', () => {
    const rows = mapVendorsForSettings(
      [
        { id: '1', name: 'Acme' },
        { id: '2', name: 'Beispiel' }
      ],
      [
        {
          id: '10',
          name: 'Qualitaet',
          weight: 100,
          questionsByVendor: [
            { vendorId: '1', questions: [{ id: '99', nr: '1', frage: 'A', punkte: 1, anteil: 1, gewichtetePunkte: 1 }] },
            { vendorId: '2', questions: [] }
          ]
        }
      ]
    )

    expect(rows.map(row => ({ id: row.id, hasImportedQuestions: row.hasImportedQuestions }))).toEqual([
      { id: '1', hasImportedQuestions: true },
      { id: '2', hasImportedQuestions: false }
    ])
  })

  it('allows renaming a vendor even when questions exist', async () => {
    updateVendorMock.mockResolvedValue(undefined)

    const vendors = computed(() => [
      { id: '1', name: 'Acme' }
    ])
    const sections = computed(() => [
      {
        id: '10',
        name: 'Qualitaet',
        weight: 100,
        questionsByVendor: [
          { vendorId: '1', questions: [{ id: '99', nr: '1', frage: 'A', punkte: 1, anteil: 1, gewichtetePunkte: 1 }] }
        ]
      }
    ])

    const state = runInScope(() => useTenderVendorsSettings('7', vendors, sections))

    state.openEditModal(state.rows.value[0]!)
    state.form.name = 'Acme Europe'

    expect(state.canSave.value).toBe(true)

    await state.handleSubmit()

    expect(updateVendorMock).toHaveBeenCalledWith('1', {
      name: 'Acme Europe'
    })
    expect(state.isModalOpen.value).toBe(false)
  })
})
