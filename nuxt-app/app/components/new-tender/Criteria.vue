<script setup lang="ts">
defineProps<{
  criteria: { name: string; weight: number }[]
  totalWeight: number
}>()

const emit = defineEmits(['add', 'remove'])
</script>

<template>
  <div class="space-y-4 min-h-[300px]">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Abschnitte und Gewichtung</h3>
      <UButton icon="i-heroicons-plus" variant="subtle" size="xs" @click="emit('add')">Abschnitt hinzufügen</UButton>
    </div>
    
    <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2">
      <div v-for="(item, index) in criteria" :key="index" class="flex gap-4 items-end ui-bg-muted p-3 rounded-lg group border border-transparent hover:ui-border transition-colors">
        <UFormField label="Name" class="flex-1">
          <UInput v-model="item.name" placeholder="z.B. Service Level" />
        </UFormField>
        <UFormField label="Gewichtung %" class="w-32">
          <UInputNumber v-model="item.weight" :min="0" :max="100" />
        </UFormField>
        <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" @click="emit('remove', index)" />
      </div>
    </div>
    
    <div class="pt-4 border-t ui-border flex justify-end">
      <div class="text-sm font-medium" :class="totalWeight === 100 ? 'text-success' : 'text-error'">
        Summe: {{ totalWeight }}% / 100%
      </div>
    </div>
  </div>
</template>
