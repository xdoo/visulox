<script setup lang="ts">
const props = defineProps<{
  sectionName: string
}>()

const emit = defineEmits<{
  uploaded: [csvContent: string]
  error: [message: string]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const csvFile = ref<File | null>(null)
const csvError = ref('')

async function handleCsvSelection(file: File | null | undefined) {
  csvError.value = ''

  if (!file) {
    return
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    csvFile.value = null
    csvError.value = 'Bitte laden Sie eine CSV-Datei hoch.'
    emit('error', csvError.value)
    return
  }

  try {
    const csvContent = await file.text()
    emit('uploaded', csvContent)
  } catch {
    csvError.value = 'Die CSV-Datei konnte nicht gelesen werden.'
    emit('error', csvError.value)
  }
}

watch(csvFile, async (file) => {
  await handleCsvSelection(file)
})

watch(isOpen, (open) => {
  if (open) {
    csvFile.value = null
    csvError.value = ''
  }
})
</script>

<template>
  <UModal v-model:open="isOpen" title="CSV hochladen" :ui="{ width: 'sm:max-w-2xl' }">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm ui-text-muted">
          Laden Sie eine CSV-Datei fuer den Abschnitt {{ props.sectionName }} hoch.
        </p>

        <UFileUpload
          v-model="csvFile"
          accept=".csv,text/csv"
          label="CSV-Datei auswaehlen"
          description="Es ist nur eine einzelne CSV-Datei erlaubt."
          class="w-full"
        />

        <p v-if="csvError" class="text-sm text-error">
          {{ csvError }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end">
        <UButton color="neutral" variant="ghost" @click="isOpen = false">
          Schliessen
        </UButton>
      </div>
    </template>
  </UModal>
</template>
