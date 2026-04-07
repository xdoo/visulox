<script setup lang="ts">
const isOpen = defineModel<boolean>('open', { default: false })

const items = [
  { label: 'Basis', icon: 'i-heroicons-information-circle' },
  { label: 'Kriterien', icon: 'i-heroicons-list-bullet' },
  { label: 'Preisblatt', icon: 'i-heroicons-currency-euro' },
  { label: 'Anbieter', icon: 'i-heroicons-user-group' }
]

const activeStep = ref(0)

// Local state for the prototype
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

function addCriterion() {
  tenderData.criteria.push({ name: '', weight: 0 })
}

function removeCriterion(index: number) {
  tenderData.criteria.splice(index, 1)
}

function addPriceBlock() {
  tenderData.priceBlocks.push({ name: '' })
}

function removePriceBlock(index: number) {
  tenderData.priceBlocks.splice(index, 1)
}

function addVendor() {
  tenderData.vendors.push({ name: '' })
}

function removeVendor(index: number) {
  tenderData.vendors.splice(index, 1)
}

function nextStep() {
  if (activeStep.value < items.length - 1 && isStepValid.value) {
    activeStep.value++
  }
}

function prevStep() {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

function handleFinish() {
  isOpen.value = false
  // Reset for prototype
  activeStep.value = 0
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Neue Ausschreibung anlegen" :ui="{ width: 'sm:max-w-2xl' }">
    <template #body>
      <div class="space-y-8">
        <UStepper v-model="activeStep" :items="items" class="mb-8" />

        <!-- Step 1: Basis -->
        <div v-if="activeStep === 0" class="space-y-4 min-h-[300px]">
          <UFormField label="Name der Ausschreibung" help="Geben Sie einen aussagekräftigen Namen an.">
            <UInput v-model="tenderData.name" placeholder="z.B. IT-Dienstleistungen 2026" class="w-full" size="lg" />
          </UFormField>
        </div>

        <!-- Step 2: Kriterienkatalog -->
        <div v-if="activeStep === 1" class="space-y-4 min-h-[300px]">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold">Abschnitte und Gewichtung</h3>
            <UButton icon="i-heroicons-plus" variant="subtle" size="xs" @click="addCriterion">Abschnitt hinzufügen</UButton>
          </div>
          
          <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            <div v-for="(item, index) in tenderData.criteria" :key="index" class="flex gap-4 items-end bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg group">
              <UFormField label="Name" class="flex-1">
                <UInput v-model="item.name" placeholder="z.B. Service Level" />
              </UFormField>
              <UFormField label="Gewichtung %" class="w-32">
                <UInputNumber v-model="item.weight" :min="0" :max="100" />
              </UFormField>
              <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" @click="removeCriterion(index)" />
            </div>
          </div>
          
          <div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <div class="text-sm font-medium" :class="totalWeight === 100 ? 'text-success' : 'text-error'">
              Summe: {{ totalWeight }}% / 100%
            </div>
          </div>
        </div>

        <!-- Step 3: Preisblatt -->
        <div v-if="activeStep === 2" class="space-y-4 min-h-[300px]">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold">Kostenblöcke definieren</h3>
            <UButton icon="i-heroicons-plus" variant="subtle" size="xs" @click="addPriceBlock">Kostenblock hinzufügen</UButton>
          </div>

          <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            <div v-for="(item, index) in tenderData.priceBlocks" :key="index" class="flex gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <UFormField label="Bezeichnung des Kostenblocks" class="flex-1">
                <UInput v-model="item.name" placeholder="z.B. Implementierungspauschale" />
              </UFormField>
              <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" class="mt-6" @click="removePriceBlock(index)" />
            </div>
          </div>
        </div>

        <!-- Step 4: Anbieter -->
        <div v-if="activeStep === 3" class="space-y-4 min-h-[300px]">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold">Teilnehmende Anbieter</h3>
            <UButton icon="i-heroicons-plus" variant="subtle" size="xs" @click="addVendor">Anbieter hinzufügen</UButton>
          </div>

          <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            <div v-for="(item, index) in tenderData.vendors" :key="index" class="flex gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <UFormField label="Name des Anbieters" class="flex-1">
                <UInput v-model="item.name" placeholder="z.B. Firma XYZ GmbH" />
              </UFormField>
              <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" class="mt-6" @click="removeVendor(index)" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <UButton color="neutral" variant="ghost" :disabled="activeStep === 0" @click="prevStep">Zurück</UButton>
        <div class="flex gap-2">
          <UButton color="neutral" variant="outline" @click="isOpen = false">Abbrechen</UButton>
          <UButton v-if="activeStep < items.length - 1" :disabled="!isStepValid" @click="nextStep">Weiter</UButton>
          <UButton v-else color="success" :disabled="!isStepValid" @click="handleFinish">Ausschreibung erstellen</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
