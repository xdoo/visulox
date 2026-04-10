<script setup lang="ts">
import type { SectionSettingsRow } from '../../composables/useTenderSectionsSettings'

const open = defineModel<boolean>('open', { required: true })
const name = defineModel<string>('name', { required: true })
const weight = defineModel<string>('weight', { required: true })

const props = defineProps<{
  mode: 'create' | 'edit'
  selectedSection: SectionSettingsRow | null
  pendingAction: string
  canSave: boolean
  modalLockReason: string
}>()

const modalTitle = computed(() => {
  return props.mode === 'create' ? 'Abschnitt hinzufügen' : 'Abschnitt bearbeiten'
})

const modalDescription = computed(() => {
  return props.mode === 'create'
    ? 'Fügen Sie einen neuen Abschnitt zum Kriterienkatalog hinzu.'
    : 'Bearbeiten Sie Name und Gewicht des Abschnitts.'
})

const isSaving = computed(() => {
  return props.pendingAction === 'create' || props.pendingAction === `save:${props.selectedSection?.id || ''}`
})

const isWeightLocked = computed(() => {
  return Boolean(props.selectedSection?.hasImportedQuestions)
})

defineEmits<{
  submit: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    :title="modalTitle"
    :description="modalDescription"
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="modalLockReason"
          color="warning"
          variant="subtle"
          :description="modalLockReason"
          icon="i-lucide-lock"
        />

        <UFormField label="Abschnitt">
          <UInput
            v-model="name"
            class="w-full"
            placeholder="Titel des Abschnitts"
            :disabled="pendingAction !== ''"
          />
        </UFormField>

        <UFormField label="Gewicht">
          <UTooltip
            text="Das Gewicht kann nicht geändert werden, weil für diesen Abschnitt bereits Fragen importiert wurden. Das Abschnittsgewicht gilt für die gesamte Ausschreibung."
            :disabled="!isWeightLocked"
          >
            <span class="block">
              <UFieldGroup>
                <UInput
                  v-model="weight"
                  class="w-24"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  :disabled="isWeightLocked || pendingAction !== ''"
                />
                <UBadge color="neutral" variant="subtle">
                  %
                </UBadge>
              </UFieldGroup>
            </span>
          </UTooltip>
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
