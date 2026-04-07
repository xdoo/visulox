import { computed, reactive, ref } from 'vue'

import type { NewTenderFormData, TenderCriterion, TenderPriceBlock, TenderVendor } from '../types/new-tender'

function createCriterion(): TenderCriterion {
  return { name: '', weight: 0 }
}

function createPriceBlock(): TenderPriceBlock {
  return { name: '' }
}

function createVendor(): TenderVendor {
  return { name: '' }
}

function createInitialTenderData(): NewTenderFormData {
  return {
    name: '',
    criteria: [createCriterion()],
    priceBlocks: [createPriceBlock()],
    vendors: [createVendor()]
  }
}

export function useNewTender() {
  const activeStep = ref(0)

  const tenderData = reactive<NewTenderFormData>(createInitialTenderData())

  const totalWeight = computed(() => {
    return tenderData.criteria.reduce((sum, item) => sum + (item.weight || 0), 0)
  })

  const hasNamedEntries = <T extends { name: string }>(items: T[]) => {
    return items.length > 0 && items.every(item => item.name.trim().length > 0)
  }

  const isStepValid = computed(() => {
    if (activeStep.value === 0) {
      return tenderData.name.trim().length > 0
    }

    if (activeStep.value === 1) {
      return totalWeight.value === 100 && hasNamedEntries(tenderData.criteria)
    }

    if (activeStep.value === 2) {
      return hasNamedEntries(tenderData.priceBlocks)
    }

    if (activeStep.value === 3) {
      return hasNamedEntries(tenderData.vendors)
    }

    return true
  })

  function addCriterion() {
    tenderData.criteria.push(createCriterion())
  }

  function removeCriterion(index: number) {
    tenderData.criteria.splice(index, 1)
  }

  function addPriceBlock() {
    tenderData.priceBlocks.push(createPriceBlock())
  }

  function removePriceBlock(index: number) {
    tenderData.priceBlocks.splice(index, 1)
  }

  function addVendor() {
    tenderData.vendors.push(createVendor())
  }

  function removeVendor(index: number) {
    tenderData.vendors.splice(index, 1)
  }

  function nextStep(maxSteps: number) {
    if (activeStep.value < maxSteps - 1 && isStepValid.value) {
      activeStep.value++
    }
  }
  function prevStep() {
    if (activeStep.value > 0) {
      activeStep.value--
    }
  }

  function reset() {
    const initialData = createInitialTenderData()

    activeStep.value = 0
    tenderData.name = initialData.name
    tenderData.criteria = initialData.criteria
    tenderData.priceBlocks = initialData.priceBlocks
    tenderData.vendors = initialData.vendors
  }

  return {
    activeStep,
    tenderData,
    totalWeight,
    isStepValid,
    addCriterion,
    removeCriterion,
    addPriceBlock,
    removePriceBlock,
    addVendor,
    removeVendor,
    nextStep,
    prevStep,
    reset
  }
}
