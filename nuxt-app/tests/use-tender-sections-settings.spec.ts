import { describe, expect, it, vi, beforeEach } from 'vitest'
import { computed, effectScope, ref } from 'vue'

import {
  calculateNextSectionWeightTotal,
  mapSectionsForSettings,
  parseSectionWeight,
  useTenderSectionsSettings
} from '../app/composables/useTenderSectionsSettings'

const addSectionMock = vi.fn()
const updateSectionMock = vi.fn()
const deleteSectionMock = vi.fn()
const clearErrorMock = vi.fn()
const toastAddMock = vi.fn()

vi.mock('../app/composables/useTenderSectionMutations', () => ({
  useTenderSectionMutations: () => ({
    errorMessage: ref(''),
    addSection: addSectionMock,
    updateSection: updateSectionMock,
    deleteSection: deleteSectionMock,
    clearError: clearErrorMock
  })
}))

vi.stubGlobal('useToast', () => ({
  add: toastAddMock
}))

function runInScope<T>(factory: () => T) {
  let result!: T

  effectScope().run(() => {
    result = factory()
  })

  return result
}

describe('useTenderSectionsSettings', () => {
  beforeEach(() => {
    addSectionMock.mockReset()
    updateSectionMock.mockReset()
    deleteSectionMock.mockReset()
    clearErrorMock.mockReset()
    toastAddMock.mockReset()
  })

  it('maps imported questions to row lock state', () => {
    const rows = mapSectionsForSettings([
      {
        id: '1',
        name: 'Qualitaet',
        weight: 60,
        questionsByVendor: [
          { vendorId: '10', questions: [{ id: '1', nr: '1', frage: 'A', punkte: 1, anteil: 0.6, gewichtetePunkte: 0.6 }] }
        ]
      },
      {
        id: '2',
        name: 'Preis',
        weight: 40,
        questionsByVendor: [
          { vendorId: '10', questions: [] }
        ]
      }
    ])

    expect(rows.map(row => ({ id: row.id, hasImportedQuestions: row.hasImportedQuestions }))).toEqual([
      { id: '1', hasImportedQuestions: true },
      { id: '2', hasImportedQuestions: false }
    ])
  })

  it('parses valid integer weights and rejects invalid values', () => {
    expect(parseSectionWeight('25')).toBe(25)
    expect(parseSectionWeight('25.5')).toBeNull()
    expect(parseSectionWeight('abc')).toBeNull()
  })

  it('calculates the next total weight for create and edit flows', () => {
    expect(calculateNextSectionWeightTotal({
      currentTotal: 70,
      nextWeight: 20,
      mode: 'create'
    })).toBe(90)

    expect(calculateNextSectionWeightTotal({
      currentTotal: 70,
      nextWeight: 35,
      mode: 'edit',
      selectedSectionWeight: 40
    })).toBe(65)
  })

  it('allows renaming locked sections while keeping the original weight', async () => {
    updateSectionMock.mockResolvedValue(undefined)

    const sections = computed(() => [
      {
        id: '1',
        name: 'Qualitaet',
        weight: 60,
        questionsByVendor: [
          { vendorId: '10', questions: [{ id: '1', nr: '1', frage: 'A', punkte: 1, anteil: 0.6, gewichtetePunkte: 0.6 }] }
        ]
      }
    ])

    const state = runInScope(() => useTenderSectionsSettings('7', sections))

    state.openEditModal(state.rows.value[0]!)
    state.form.name = 'Qualität'

    expect(state.canSave.value).toBe(true)

    await state.handleSubmit()

    expect(updateSectionMock).toHaveBeenCalledWith('1', {
      name: 'Qualität',
      weight: 60
    })
    expect(state.isModalOpen.value).toBe(false)
    expect(toastAddMock).toHaveBeenCalledWith({
      title: 'Gewichtssumme ungleich 100%',
      description: 'Die Abschnitte wurden gespeichert. Die aktuelle Summe beträgt 60%.',
      color: 'warning',
      icon: 'i-lucide-triangle-alert'
    })
  })
})
