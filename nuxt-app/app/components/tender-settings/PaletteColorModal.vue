<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const fillColor = defineModel<string>('fillColor', { required: true })
const textColor = defineModel<string>('textColor', { required: true })

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
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3">
            <p class="text-sm font-medium">Farbe</p>
            <div class="flex justify-center">
              <UColorPicker v-model="fillColor" />
            </div>

            <UFormField label="Farb-Code">
              <UInput
                v-model="fillColor"
                class="w-full"
                placeholder="#0D57A6"
              />
            </UFormField>
          </div>

          <div class="space-y-3">
            <p class="text-sm font-medium">Schriftfarbe</p>
            <div class="flex justify-center">
              <UColorPicker v-model="textColor" />
            </div>

            <UFormField label="Schriftfarbe">
              <UInput
                v-model="textColor"
                class="w-full"
                placeholder="#FFFFFF"
              />
            </UFormField>
          </div>
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
          @click="$emit('submit')"
        >
          Speichern
        </UButton>
      </div>
    </template>
  </UModal>
</template>
