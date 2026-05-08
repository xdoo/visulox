<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const assessmentText = defineModel<string>('assessmentText', { required: true })

const props = defineProps<{
  catalogName: string
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
    :title="`Bewertungstext: ${props.catalogName || 'Kriterienkatalog'}`"
    description="Pflegen Sie den Bewertungstext dieses Kriterienkatalogs."
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

        <UFormField label="Bewertungstext">
          <UTextarea
            v-model="assessmentText"
            class="w-full font-mono text-sm"
            autoresize
            :rows="12"
            placeholder="Bewertungstext einfügen"
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
