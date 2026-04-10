<script setup lang="ts">
import type { VendorSettingsRow } from '../../composables/useTenderVendorsSettings'

const open = defineModel<boolean>('open', { required: true })
const name = defineModel<string>('name', { required: true })

const props = defineProps<{
  mode: 'create' | 'edit'
  selectedVendor: VendorSettingsRow | null
  pendingAction: string
  canSave: boolean
}>()

const modalTitle = computed(() => {
  return props.mode === 'create' ? 'Anbieter hinzufügen' : 'Anbieter bearbeiten'
})

const isSaving = computed(() => {
  return props.pendingAction === 'create' || props.pendingAction === `save:${props.selectedVendor?.id || ''}`
})

defineEmits<{
  submit: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    :title="modalTitle"
    description="Pflegen Sie die Anbieter dieser Ausschreibung."
  >
    <template #body>
      <div class="space-y-4">
        <UFormField label="Anbieter">
          <UInput
            v-model="name"
            class="w-full"
            placeholder="Name des Anbieters"
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
