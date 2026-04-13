import { ref } from 'vue'

import { formatVendorCostInputValue } from './useTenderVendorCosts'

import type { VendorCostRow } from './useTenderVendorCosts'

export function getVendorCostInputValue(row: VendorCostRow, focusedCostBlockId: string) {
  return focusedCostBlockId === row.costBlockId
    ? row.amount
    : formatVendorCostInputValue(row.amount)
}

export function formatVendorCostSummaryValue(value: number) {
  return formatVendorCostInputValue(String(value))
}

export function useVendorCostGroupInputs() {
  const focusedCostBlockId = ref('')

  function focusCostBlock(costBlockId: string) {
    focusedCostBlockId.value = costBlockId
  }

  function clearFocusedCostBlock() {
    focusedCostBlockId.value = ''
  }

  function getInputValue(row: VendorCostRow) {
    return getVendorCostInputValue(row, focusedCostBlockId.value)
  }

  function getSummaryValue(value: number) {
    return formatVendorCostSummaryValue(value)
  }

  function handleEnter(event: KeyboardEvent) {
    const currentInput = event.currentTarget as HTMLInputElement | null

    if (!currentInput) {
      return
    }

    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-vendor-cost-input="true"]'))
    const currentIndex = inputs.indexOf(currentInput)
    const nextInput = currentIndex >= 0 ? inputs[currentIndex + 1] : null

    if (!nextInput) {
      return
    }

    event.preventDefault()
    nextInput.focus()
    nextInput.select()
  }

  return {
    focusCostBlock,
    clearFocusedCostBlock,
    getInputValue,
    getSummaryValue,
    handleEnter
  }
}
