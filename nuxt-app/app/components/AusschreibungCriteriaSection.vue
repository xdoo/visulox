<script setup lang="ts">
import AusschreibungSectionCsvUpload from './AusschreibungSectionCsvUpload.vue'

import type { AusschreibungSection } from '../../shared/types/ausschreibungen'

const props = defineProps<{
  section: AusschreibungSection
}>()

const isUploadModalOpen = ref(false)
const csvContent = ref('')
const csvError = ref('')

function handleCsvUploaded(content: string) {
  csvError.value = ''
  csvContent.value = content
  isUploadModalOpen.value = false
}

function handleCsvError(message: string) {
  csvError.value = message
}

watch(isUploadModalOpen, (open) => {
  if (open) {
    csvError.value = ''
  }
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="font-semibold">{{ props.section.name }}</h3>
          <p class="mt-1 text-sm ui-text-muted">
            Abschnitt des Kriterienkatalogs
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            icon="i-heroicons-cloud-arrow-up"
            color="neutral"
            variant="outline"
            aria-label="CSV fuer Abschnitt hochladen"
            @click="isUploadModalOpen = true"
          />

          <UBadge color="neutral" variant="subtle" size="lg">
            {{ props.section.weight }}%
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm ui-text-muted">
        Weitere fachliche Logik fuer diesen Abschnitt wird hier aufgebaut.
      </p>

      <div
        v-if="csvContent"
        class="space-y-2"
      >
        <p class="text-sm font-medium">CSV-Inhalt</p>
        <pre class="overflow-x-auto rounded-lg border ui-border bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-950 dark:text-gray-100">{{ csvContent }}</pre>
      </div>

      <p v-if="csvError" class="text-sm text-error">
        {{ csvError }}
      </p>
    </div>

    <AusschreibungSectionCsvUpload
      v-model:open="isUploadModalOpen"
      :section-name="props.section.name"
      @uploaded="handleCsvUploaded"
      @error="handleCsvError"
    />
  </UCard>
</template>
