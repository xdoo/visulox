<script setup lang="ts">
import type { TenderSection } from '../../../shared/types/tenders'

const open = defineModel<boolean>('open', { required: true })
const resultAssessment = defineModel<string>('resultAssessment', { required: true })

const props = defineProps<{
  selectedSection: TenderSection | null
  isSaving: boolean
  canSave: boolean
  errorMessage: string
}>()

defineEmits<{
  submit: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.selectedSection ? `Ergebnisbewertung: ${props.selectedSection.name}` : 'Ergebnisbewertung'"
    description="Fügen Sie die aus der Anbieterbewertung abgeleitete Ergebnisbewertung für den Report ein."
    :ui="{ content: 'sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="props.errorMessage"
          color="error"
          variant="subtle"
          :description="props.errorMessage"
          icon="i-lucide-circle-alert"
        />

        <UFormField
          label="Ergebnisbewertung"
          description="Markdown wird unterstützt."
        >
          <UEditor
            v-model="resultAssessment"
            content-type="markdown"
            class="min-h-56 w-full"
            placeholder="LLM-Ergebnisbewertung der Kategorie einfügen"
            :disabled="props.isSaving"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="props.isSaving"
          @click="open = false"
        >
          Abbrechen
        </UButton>
        <UButton
          icon="i-lucide-save"
          :loading="props.isSaving"
          :disabled="!props.canSave"
          @click="$emit('submit')"
        >
          Speichern
        </UButton>
      </div>
    </template>
  </UModal>
</template>
