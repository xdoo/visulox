<script setup lang="ts">
defineProps<{
  vendors: { name: string }[]
}>()

const emit = defineEmits(['add', 'remove'])
</script>

<template>
  <div class="space-y-4 min-h-[300px]">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Teilnehmende Anbieter</h3>
      <UButton icon="i-heroicons-plus" variant="subtle" size="xs" @click="emit('add')">Anbieter hinzufügen</UButton>
    </div>

    <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2">
      <div v-for="(item, index) in vendors" :key="index" class="flex gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
        <UFormField label="Name des Anbieters" class="flex-1">
          <UInput v-model="item.name" placeholder="z.B. Firma XYZ GmbH" />
        </UFormField>
        <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" class="mt-6" @click="emit('remove', index)" />
      </div>
    </div>
  </div>
</template>
