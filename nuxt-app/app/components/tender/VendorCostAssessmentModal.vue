<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const assessment = defineModel<string>('assessment', { required: true })

const props = defineProps<{
  title: string
  kind: 'project' | 'run'
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
    :title="props.title"
    :description="props.kind === 'project'
      ? 'Fügen Sie die Einordnung der Projektkosten für den Report ein.'
      : 'Fügen Sie die Einordnung der Run-Kosten für den Report ein.'"
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
            v-model="assessment"
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
