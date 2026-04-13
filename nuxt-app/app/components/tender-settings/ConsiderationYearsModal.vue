<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const considerationYears = defineModel<number>('considerationYears', { required: true })

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
    title="Betrachtungszeitraum bearbeiten"
    description="Legen Sie fest, über wie viele Jahre nach Projektende die Kosten betrachtet werden."
  >
    <template #body>
      <div class="space-y-6">
        <USlider
          v-model="considerationYears"
          :min="1"
          :max="20"
          :step="1"
          color="primary"
        />

        <UFormField label="Zeitraum">
          <UInput :model-value="`${considerationYears} Jahre`" disabled />
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
          :loading="props.isSaving"
          @click="$emit('submit')"
        >
          Speichern
        </UButton>
      </div>
    </template>
  </UModal>
</template>
