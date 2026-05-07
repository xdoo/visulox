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
    title="Kriterienkatalog klonen"
    description="Es wird ein weiterer Kriterienkatalog innerhalb derselben Ausschreibung erstellt. Kategorien werden als leere Struktur übernommen; Bewertungen/Fragen bleiben leer."
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
          icon="i-lucide-copy"
          color="primary"
          :loading="isSaving"
          @click="$emit('submit')"
        >
          Kriterienkatalog klonen
        </UButton>
      </div>
    </template>
  </UModal>
</template>
