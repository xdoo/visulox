<script setup lang="ts">
defineProps<{
  tenderData: { name: string }
}>()
</script>

<template>
  <div class="space-y-4 min-h-[300px]">
    <UFormField label="Name der Ausschreibung" help="Geben Sie einen aussagekräftigen Namen an.">
      <UInput v-model="tenderData.name" placeholder="z.B. IT-Dienstleistungen 2026" class="w-full" size="lg" />
    </UFormField>
  </div>
</template>
