<script setup lang="ts">
import { watch } from 'vue'

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

const {
  isSaving,
  errorMessage,
  createAusschreibung,
  clearError
} = useCreateAusschreibung()

watch(isOpen, (open) => {
  if (!open) {
    clearError()
  }
})

async function handleFinish() {
  try {
    await createAusschreibung(tenderData)
    isOpen.value = false
    reset()
  } catch {
    // Error state is handled by the composable and displayed in the modal.
  }
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Neue Ausschreibung anlegen" :ui="{ width: 'sm:max-w-2xl' }">
    <template #body>
      <div class="space-y-8">
        <UStepper v-model="activeStep" :items="items" class="mb-8" />

        <NewTenderBasis v-if="activeStep === 0" v-model:name="tenderData.name" />
        
        <NewTenderCriteria 
          v-if="activeStep === 1" 
          v-model:criteria="tenderData.criteria"
          :total-weight="totalWeight"
          @add="addCriterion"
          @remove="removeCriterion"
        />

        <NewTenderPriceBlocks
          v-if="activeStep === 2"
          v-model:price-blocks="tenderData.priceBlocks"
          @add="addPriceBlock"
          @remove="removePriceBlock"
        />

        <NewTenderVendors
          v-if="activeStep === 3"
          v-model:vendors="tenderData.vendors"
          @add="addVendor"
          @remove="removeVendor"
        />

        <p v-if="errorMessage" class="text-sm text-error">
          {{ errorMessage }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <UButton color="neutral" variant="ghost" :disabled="activeStep === 0" @click="prevStep">Zurück</UButton>
        <div class="flex gap-2">
          <UButton color="neutral" variant="outline" @click="isOpen = false">Abbrechen</UButton>
          <UButton v-if="activeStep < items.length - 1" :disabled="!isStepValid" @click="nextStep(items.length)">Weiter</UButton>
          <UButton v-else color="success" :loading="isSaving" :disabled="!isStepValid || isSaving" @click="handleFinish">Ausschreibung erstellen</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
