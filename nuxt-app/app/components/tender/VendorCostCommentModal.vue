<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const comment = defineModel<string>('comment', { required: true })

const props = defineProps<{
  costBlockName: string
  canSave: boolean
}>()

defineEmits<{
  save: []
  cancel: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    title="Kommentar zu Kostenblock"
    :description="props.costBlockName"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <UFormField label="Kommentar">
        <UTextarea
          v-model="comment"
          class="w-full"
          autoresize
          :rows="6"
          placeholder="Kommentar zum Kostenblock eingeben"
        />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <UButton color="neutral" variant="ghost" @click="$emit('cancel')">
          Abbrechen
        </UButton>
        <UButton
          icon="i-lucide-save"
          :disabled="!props.canSave"
          @click="$emit('save')"
        >
          Übernehmen
        </UButton>
      </div>
    </template>
  </UModal>
</template>
