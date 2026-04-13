import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import {
  calculateVendorCostTotal,
  formatVendorCostInputValue,
  formatVendorCostAmount,
  getVendorCostGroup,
  mapVendorCostRows,
  parseVendorCostAmount,
  useTenderVendorCosts
} from '../app/composables/useTenderVendorCosts'

vi.mock('../app/composables/useTenderSettingsMutation', () => ({
  useTenderSettingsMutation: () => ({
    errorMessage: ref(''),
    runMutation: vi.fn(async (action: () => Promise<unknown>) => await action()),
    clearError: vi.fn()
  })
}))

describe('useTenderVendorCosts', () => {
  it('groups cost block types into project and run', () => {
    expect(getVendorCostGroup('project')).toBe('project')
    expect(getVendorCostGroup('license_one_time')).toBe('project')
    expect(getVendorCostGroup('vendor_operating')).toBe('run')
    expect(getVendorCostGroup('infrastructure')).toBe('run')
  })

  it('parses and formats amounts', () => {
    expect(formatVendorCostAmount(null)).toBe('')
    expect(formatVendorCostAmount(12.5)).toBe('12.5')
    expect(formatVendorCostInputValue('1234.5')).toBe('1.234,5')
    expect(formatVendorCostInputValue('1.234,5')).toBe('1.234,5')
    expect(parseVendorCostAmount('')).toBeNull()
    expect(parseVendorCostAmount('12,5')).toBe(12.5)
    expect(parseVendorCostAmount('1.234,5')).toBe(1234.5)
    expect(Number.isNaN(parseVendorCostAmount('-1'))).toBe(true)
  })

  it('maps vendor cost rows from blocks and saved items', () => {
    expect(mapVendorCostRows(
      [
        { id: '41', name: 'Projektteam', type: 'project' },
        { id: '42', name: 'Hosting', type: 'infrastructure' }
      ],
      [
        { id: '1', vendorId: '11', costBlockId: '41', amount: 1000 }
      ],
      '11'
    )).toEqual([
      { costBlockId: '41', name: 'Projektteam', type: 'project', amount: '1000' },
      { costBlockId: '42', name: 'Hosting', type: 'infrastructure', amount: '' }
    ])
  })

  it('calculates group totals from valid row amounts', () => {
    expect(calculateVendorCostTotal([
      { costBlockId: '41', name: 'Projektteam', type: 'project', amount: '1.000,5' },
      { costBlockId: '42', name: 'Lizenz', type: 'license_one_time', amount: '250' },
      { costBlockId: '43', name: 'Optional', type: 'project', amount: '' },
      { costBlockId: '44', name: 'Fehlerhaft', type: 'project', amount: 'abc' }
    ])).toBe(1250.5)
  })

  it('exposes grouped rows and change tracking', () => {
    const vendor = ref({ id: '11', name: 'Acme' })
    const costBlocks = ref([
      { id: '41', name: 'Projektteam', type: 'project' as const },
      { id: '42', name: 'Hosting', type: 'infrastructure' as const }
    ])
    const vendorCostItems = ref([
      { id: '1', vendorId: '11', costBlockId: '41', amount: 1000 }
    ])

    const state = useTenderVendorCosts(
      '1',
      computed(() => vendor.value),
      computed(() => costBlocks.value),
      computed(() => vendorCostItems.value),
      computed(() => 10)
    )

    expect(state.projectRows.value).toHaveLength(1)
    expect(state.runRows.value).toHaveLength(1)
    expect(state.projectTotal.value).toBe(1000)
    expect(state.runTotal.value).toBe(0)
    expect(state.runTotalOverConsiderationYears.value).toBe(0)
    expect(state.canSave.value).toBe(false)

    state.updateAmount('42', '250')

    expect(state.canSave.value).toBe(true)
    expect(state.runTotal.value).toBe(250)
    expect(state.runTotalOverConsiderationYears.value).toBe(2500)
  })
})
