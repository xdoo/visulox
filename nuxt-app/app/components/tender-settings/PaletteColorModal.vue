<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const color = defineModel<string>('color', { required: true })

defineEmits<{
  submit: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    title="Farbe bearbeiten"
    description="Wählen Sie eine Farbe aus oder geben Sie einen Hex-Code direkt ein."
  >
    <template #body>
      <div class="space-y-4">
        <div class="flex justify-center">
          <UColorPicker v-model="color" />
        </div>

        <UFormField label="Farb-Code">
          <UInput
            v-model="color"
            class="w-full"
            placeholder="#0D57A6"
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
          color="primary"
          @click="$emit('submit')"
        >
          Speichern
        </UButton>
      </div>
    </template>
  </UModal>
</template>
