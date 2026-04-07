export function useNewTender() {
  const activeStep = ref(0)
  
  const tenderData = reactive({
    name: '',
    criteria: [
      { name: '', weight: 0 }
    ],
    priceBlocks: [
      { name: '' }
    ],
    vendors: [
      { name: '' }
    ]
  })

  // Validations
  const totalWeight = computed(() => {
    return tenderData.criteria.reduce((sum, item) => sum + (item.weight || 0), 0)
  })

  const isStepValid = computed(() => {
    if (activeStep.value === 0) {
      return tenderData.name.trim().length > 0
    }
    if (activeStep.value === 1) {
      return totalWeight.value === 100
    }
    return true
  })

  // Actions: Criteria
  function addCriterion() {
    tenderData.criteria.push({ name: '', weight: 0 })
  }
  function removeCriterion(index: number) {
    tenderData.criteria.splice(index, 1)
  }

  // Actions: Price Blocks
  function addPriceBlock() {
    tenderData.priceBlocks.push({ name: '' })
  }
  function removePriceBlock(index: number) {
    tenderData.priceBlocks.splice(index, 1)
  }

  // Actions: Vendors
  function addVendor() {
    tenderData.vendors.push({ name: '' })
  }
  function removeVendor(index: number) {
    tenderData.vendors.splice(index, 1)
  }

  // Navigation Actions
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
    activeStep.value = 0
    tenderData.name = ''
    tenderData.criteria = [{ name: '', weight: 0 }]
    tenderData.priceBlocks = [{ name: '' }]
    tenderData.vendors = [{ name: '' }]
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
