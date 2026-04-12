<script setup lang="ts">
import { tenderCostBlockTypeOptions } from '../../../shared/constants/cost-blocks'

import type { CostBlockSettingsRow } from '../../composables/useTenderCostBlocksSettings'
import type { TenderCostBlockType } from '../../../shared/types/tenders'

const open = defineModel<boolean>('open', { required: true })
const name = defineModel<string>('name', { required: true })
const costBlockType = defineModel<TenderCostBlockType>('costBlockType', { required: true })

const props = defineProps<{
  mode: 'create' | 'edit'
  selectedCostBlock: CostBlockSettingsRow | null
  pendingAction: string
  canSave: boolean
}>()

const modalTitle = computed(() => {
  return props.mode === 'create' ? 'Kostenblock hinzufügen' : 'Kostenblock bearbeiten'
})

const isSaving = computed(() => {
  return props.pendingAction === 'create' || props.pendingAction === `save:${props.selectedCostBlock?.id || ''}`
})

defineEmits<{
  submit: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    :title="modalTitle"
    description="Pflegen Sie die Kostenblöcke dieser Ausschreibung."
  >
    <template #body>
      <div class="space-y-4">
        <UFormField label="Bezeichnung">
          <UInput
            v-model="name"
            class="w-full"
            placeholder="Name des Kostenblocks"
            :disabled="pendingAction !== ''"
          />
        </UFormField>

        <UFormField label="Kostenart">
          <USelect
            v-model="costBlockType"
            :items="tenderCostBlockTypeOptions"
            value-key="value"
            label-key="label"
            class="w-full"
            :disabled="pendingAction !== ''"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">
          Abbrechen
        </UButton>
        <UButton
          icon="i-lucide-save"
          :loading="isSaving"
          :disabled="!canSave"
          @click="$emit('submit')"
        >
          Speichern
        </UButton>
      </div>
    </template>
  </UModal>
</template>
