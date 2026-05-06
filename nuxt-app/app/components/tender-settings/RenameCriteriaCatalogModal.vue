<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const name = defineModel<string>('name', { required: true })

defineProps<{
  isSaving: boolean
}>()

defineEmits<{
  submit: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    title="Kriterienkatalog umbenennen"
    description="Passen Sie den sichtbaren Namen dieses Kriterienkatalogs an."
  >
    <template #body>
      <UFormField label="Name des Kriterienkatalogs">
        <UInput
          v-model="name"
          class="w-full"
          placeholder="z. B. Bewertung VKB"
        />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">
          Abbrechen
        </UButton>

        <UButton
          icon="i-lucide-save"
          color="primary"
          :loading="isSaving"
          @click="$emit('submit')"
        >
          Speichern
        </UButton>
      </div>
    </template>
  </UModal>
</template>
