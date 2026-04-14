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
    title="Ausschreibung umbenennen"
    description="Passen Sie den sichtbaren Namen der Ausschreibung an."
  >
    <template #body>
      <UFormField label="Name">
        <UInput
          v-model="name"
          class="w-full"
          placeholder="Name der Ausschreibung"
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
