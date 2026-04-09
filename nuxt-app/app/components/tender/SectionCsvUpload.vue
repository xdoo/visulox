<script setup lang="ts">
import type { CriteriaCsvQuestionRow } from '../../types/criteria-csv'

const props = defineProps<{
  sectionName: string
  sectionWeight: number
  errorMessage?: string
  inline?: boolean
}>()

const emit = defineEmits<{
  uploaded: [questions: CriteriaCsvQuestionRow[]]
  error: [message: string]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const { csvFile, csvError, reset, bindFileWatcher } = useSectionCsvUpload({
  sectionWeight: props.sectionWeight,
  onUploaded: (questions: CriteriaCsvQuestionRow[]) => emit('uploaded', questions),
  onError: (message: string) => emit('error', message)
})

bindFileWatcher(csvFile)

watch(
  () => props.inline,
  (inline) => {
    if (inline) {
      reset()
    }
  },
  { immediate: true }
)

watch(isOpen, (open) => {
  if (props.inline) {
    return
  }

  if (open) {
    reset()
  } else {
    reset()
  }
})
</script>

<template>
  <div v-if="props.inline" class="space-y-4">
    <UFileUpload
      v-model="csvFile"
      accept=".csv,text/csv"
      label="CSV-Datei auswaehlen"
      :description="`CSV fuer Abschnitt ${props.sectionName}. Es ist nur eine einzelne CSV-Datei erlaubt.`"
      class="w-full"
    />

    <p v-if="csvError || props.errorMessage" class="text-sm text-error">
      {{ csvError || props.errorMessage }}
    </p>
  </div>

  <UModal v-else v-model:open="isOpen" title="CSV hochladen" :ui="{ content: 'sm:max-w-2xl' }">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm ui-text-muted">
          Laden Sie eine CSV-Datei fuer den Abschnitt {{ props.sectionName }} hoch.
        </p>

        <UFileUpload
          v-model="csvFile"
          accept=".csv,text/csv"
          label="CSV-Datei auswaehlen"
          :description="`CSV fuer Abschnitt ${props.sectionName}. Es ist nur eine einzelne CSV-Datei erlaubt.`"
          class="w-full"
        />

        <p v-if="csvError || props.errorMessage" class="text-sm text-error">
          {{ csvError || props.errorMessage }}
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
