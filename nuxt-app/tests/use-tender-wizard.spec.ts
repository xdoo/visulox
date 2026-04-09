import { describe, expect, it } from 'vitest'
import { effectScope } from 'vue'

import { useTenderWizard } from '../app/composables/useTenderWizard'

function runInScope<T>(factory: () => T) {
  let result!: T

  effectScope().run(() => {
    result = factory()
  })

  return result
}

describe('useTenderWizard', () => {
  it('starts with the expected default state', () => {
    const { activeStep, tenderData, totalWeight, isStepValid } = runInScope(() => useTenderWizard())

    expect(activeStep.value).toBe(0)
    expect(tenderData.name).toBe('')
    expect(tenderData.criteria).toEqual([{ name: '', weight: 0 }])
    expect(tenderData.priceBlocks).toEqual([{ name: '' }])
    expect(tenderData.vendors).toEqual([{ name: '' }])
    expect(totalWeight.value).toBe(0)
    expect(isStepValid.value).toBe(false)
  })

  it('allows navigating only when the current step is valid', () => {
    const { activeStep, tenderData, nextStep, isStepValid } = runInScope(() => useTenderWizard())

    nextStep(4)
    expect(activeStep.value).toBe(0)

    tenderData.name = 'Framework Agreement 2026'
    expect(isStepValid.value).toBe(true)

    nextStep(4)
    expect(activeStep.value).toBe(1)

    tenderData.criteria[0] = { name: 'Quality', weight: 100 }
    expect(isStepValid.value).toBe(true)

    nextStep(4)
    expect(activeStep.value).toBe(2)
  })

  it('resets the wizard state to its initial values', () => {
    const { activeStep, tenderData, addCriterion, addPriceBlock, addVendor, nextStep, reset } = runInScope(() => useTenderWizard())

    tenderData.name = 'Tender'
    nextStep(4)
    addCriterion()
    addPriceBlock()
    addVendor()
    activeStep.value = 3

    reset()

    expect(activeStep.value).toBe(0)
    expect(tenderData).toEqual({
      name: '',
      criteria: [{ name: '', weight: 0 }],
      priceBlocks: [{ name: '' }],
      vendors: [{ name: '' }]
    })
  })
})
