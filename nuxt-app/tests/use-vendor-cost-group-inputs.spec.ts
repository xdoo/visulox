import { describe, expect, it } from 'vitest'

import {
  formatVendorCostSummaryValue,
  getVendorCostInputValue
} from '../app/composables/useVendorCostGroupInputs'

describe('useVendorCostGroupInputs', () => {
  it('returns raw input while the row is focused', () => {
    expect(getVendorCostInputValue({
      costBlockId: '41',
      name: 'Hosting',
      type: 'infrastructure',
      amount: '1234.5'
    }, '41')).toBe('1234.5')
  })

  it('formats the input value when the row is not focused', () => {
    expect(getVendorCostInputValue({
      costBlockId: '41',
      name: 'Hosting',
      type: 'infrastructure',
      amount: '1234.5'
    }, '99')).toBe('1.234,5')
  })

  it('formats summary values with thousands separators', () => {
    expect(formatVendorCostSummaryValue(12345.67)).toBe('12.345,67')
  })
})
