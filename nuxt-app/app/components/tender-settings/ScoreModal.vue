<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const scoreRange = defineModel<[number, number]>('scoreRange', { required: true })

const props = defineProps<{
  isSaving: boolean
}>()

defineEmits<{
  submit: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    title="Bewertungsskala bearbeiten"
    description="Wählen Sie den Wertebereich für die Bewertung dieser Ausschreibung."
  >
    <template #body>
      <div class="space-y-6">
        <USlider
          v-model="scoreRange"
          :min="0"
          :max="100"
          :step="1"
          color="primary"
        />

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Von">
            <UInput :model-value="String(scoreRange[0])" disabled />
          </UFormField>

          <UFormField label="Bis">
            <UInput :model-value="String(scoreRange[1])" disabled />
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">
          Abbrechen
        </UButton>
        <UButton
          icon="i-lucide-save"
          color="primary"
          :loading="props.isSaving"
          @click="$emit('submit')"
        >
          Speichern
        </UButton>
      </div>
    </template>
  </UModal>
</template>
