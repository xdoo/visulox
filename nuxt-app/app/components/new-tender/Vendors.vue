<script setup lang="ts">
import type { TenderVendor } from '../../types/new-tender'

const vendors = defineModel<TenderVendor[]>('vendors', { required: true })

const emit = defineEmits<{
  add: []
  remove: [index: number]
}>()
</script>

<template>
  <div class="space-y-4 min-h-[300px]">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Teilnehmende Anbieter</h3>
      <UButton icon="i-heroicons-plus" variant="subtle" size="xs" @click="emit('add')">Anbieter hinzufügen</UButton>
    </div>

    <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2">
      <div v-for="(item, index) in vendors" :key="index" class="flex gap-4 items-center ui-bg-muted p-3 rounded-lg border border-transparent hover:ui-border transition-colors">
        <UFormField label="Name des Anbieters" class="flex-1">
          <UInput v-model="item.name" placeholder="z.B. Firma XYZ GmbH" />
        </UFormField>
        <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" class="mt-6" @click="emit('remove', index)" />
      </div>
    </div>
  </div>
</template>
