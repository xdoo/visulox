<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const confirmationName = defineModel<string>('confirmationName', { required: true })

const props = defineProps<{
  tenderName: string
  isSaving: boolean
}>()

defineEmits<{
  submit: []
}>()

const isConfirmationValid = computed(() => confirmationName.value.trim() === props.tenderName.trim())
const confirmationDescription = computed(() => `Geben Sie zum Bestätigen den Namen "${props.tenderName}" ein.`)
</script>

<template>
  <UModal
    v-model:open="open"
    title="Ausschreibung löschen"
    description="Die Ausschreibung wird in der Oberfläche nicht mehr angezeigt, bleibt aber in der Datenbank erhalten."
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          color="warning"
          variant="subtle"
          title="Bestätigung erforderlich"
          :description="confirmationDescription"
        />

        <UFormField label="Name zur Bestätigung">
          <UInput
            v-model="confirmationName"
            class="w-full"
            :placeholder="props.tenderName"
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
          icon="i-lucide-trash-2"
          color="error"
          :loading="props.isSaving"
          :disabled="!isConfirmationValid"
          @click="$emit('submit')"
        >
          Löschen
        </UButton>
      </div>
    </template>
  </UModal>
</template>
