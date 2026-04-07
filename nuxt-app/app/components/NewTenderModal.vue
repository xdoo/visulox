<script setup lang="ts">
const isOpen = defineModel<boolean>('open', { default: false })

const items = [
  { label: 'Basis', icon: 'i-heroicons-information-circle' },
  { label: 'Kriterien', icon: 'i-heroicons-list-bullet' },
  { label: 'Preisblatt', icon: 'i-heroicons-currency-euro' },
  { label: 'Anbieter', icon: 'i-heroicons-user-group' }
]

const {
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
} = useNewTender()

function handleFinish() {
  isOpen.value = false
  reset()
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Neue Ausschreibung anlegen" :ui="{ width: 'sm:max-w-2xl' }">
    <template #body>
      <div class="space-y-8">
        <UStepper v-model="activeStep" :items="items" class="mb-8" />

        <!-- Steps -->
        <NewTenderBasis v-if="activeStep === 0" :tender-data="tenderData" />
        
        <NewTenderCriteria 
          v-if="activeStep === 1" 
          :criteria="tenderData.criteria" 
          :total-weight="totalWeight"
          @add="addCriterion"
          @remove="removeCriterion"
        />

        <NewTenderPriceBlocks
          v-if="activeStep === 2"
          :price-blocks="tenderData.priceBlocks"
          @add="addPriceBlock"
          @remove="removePriceBlock"
        />

        <NewTenderVendors
          v-if="activeStep === 3"
          :vendors="tenderData.vendors"
          @add="addVendor"
          @remove="removeVendor"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <UButton color="neutral" variant="ghost" :disabled="activeStep === 0" @click="prevStep">Zurück</UButton>
        <div class="flex gap-2">
          <UButton color="neutral" variant="outline" @click="isOpen = false">Abbrechen</UButton>
          <UButton v-if="activeStep < items.length - 1" :disabled="!isStepValid" @click="nextStep(items.length)">Weiter</UButton>
          <UButton v-else color="success" :disabled="!isStepValid" @click="handleFinish">Ausschreibung erstellen</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
