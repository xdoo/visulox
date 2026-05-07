<script setup lang="ts">
import { tenderCriteriaCatalogTypeOptions } from '~~/shared/constants/criteria-catalogs'

import type { TenderCriteriaCatalogType } from '../../../shared/types/tenders'

const open = defineModel<boolean>('open', { required: true })
const name = defineModel<string>('name', { required: true })
const catalogType = defineModel<TenderCriteriaCatalogType>('catalogType', { required: true })

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
      <div class="space-y-4">
        <UFormField label="Name des Kriterienkatalogs">
          <UInput
            v-model="name"
            class="w-full"
            placeholder="z. B. Bewertung VKB"
          />
        </UFormField>

        <UFormField label="Typ">
          <USelect
            v-model="catalogType"
            :items="tenderCriteriaCatalogTypeOptions"
            value-key="value"
            label-key="label"
            class="w-full"
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
