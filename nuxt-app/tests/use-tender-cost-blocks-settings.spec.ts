import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useTenderCostBlocksSettings } from '../app/composables/useTenderCostBlocksSettings'

vi.mock('../app/composables/useTenderCostBlockMutations', () => ({
  useTenderCostBlockMutations: () => ({
    errorMessage: ref(''),
    addCostBlock: vi.fn(),
    updateCostBlock: vi.fn(),
    deleteCostBlock: vi.fn(),
    clearError: vi.fn()
  })
}))

describe('useTenderCostBlocksSettings', () => {
  it('disables save when edit form is unchanged', () => {
    const costBlocks = ref([
      { id: '1', name: 'Lizenzen', type: 'license_one_time' as const }
    ])

    const settings = useTenderCostBlocksSettings('1', computed(() => costBlocks.value))

    settings.openEditModal(costBlocks.value[0])

    expect(settings.canSave.value).toBe(false)
  })

  it('enables save when name or type changes', () => {
    const costBlocks = ref([
      { id: '1', name: 'Lizenzen', type: 'license_one_time' as const }
    ])

    const settings = useTenderCostBlocksSettings('1', computed(() => costBlocks.value))

    settings.openEditModal(costBlocks.value[0])
    settings.form.type = 'project'

    expect(settings.canSave.value).toBe(true)
  })
})

