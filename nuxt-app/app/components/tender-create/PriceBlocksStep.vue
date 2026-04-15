<script setup lang="ts">
import type { TenderPriceBlock } from '../../types/tender-wizard'

const priceBlocks = defineModel<TenderPriceBlock[]>('priceBlocks', { required: true })

const emit = defineEmits<{
  add: []
  remove: [index: number]
}>()
</script>

<template>
  <div class="space-y-4 min-h-[300px]">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold">Kostenblöcke definieren</h3>
      <UButton icon="i-lucide-plus" variant="subtle" size="xs" @click="emit('add')">Kostenblock hinzufügen</UButton>
    </div>

    <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2">
      <div v-for="(item, index) in priceBlocks" :key="index" class="flex gap-4 items-center ui-bg-muted p-3 rounded-lg border border-transparent hover:ui-border transition-colors">
        <UFormField label="Bezeichnung des Kostenblocks" class="flex-1">
          <UInput v-model="item.name" placeholder="z.B. Implementierungspauschale" />
        </UFormField>
        <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" class="mt-6" @click="emit('remove', index)" />
      </div>
    </div>
  </div>
</template>
