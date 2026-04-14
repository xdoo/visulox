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
    title="Ausschreibung klonen"
    description="Es wird nur die Struktur geklont: allgemeine Settings, Abschnitte, Kostenblöcke und Anbieter. Bewertungsdaten werden nicht übernommen."
  >
    <template #body>
      <UFormField label="Neuer Name">
        <UInput
          v-model="name"
          class="w-full"
          placeholder="Name der neuen Ausschreibung"
        />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">
          Abbrechen
        </UButton>

        <UButton
          icon="i-lucide-copy"
          color="primary"
          :loading="isSaving"
          @click="$emit('submit')"
        >
          Klonen
        </UButton>
      </div>
    </template>
  </UModal>
</template>
