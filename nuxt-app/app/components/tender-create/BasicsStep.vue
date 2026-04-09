<script setup lang="ts">
const name = defineModel<string>('name', { required: true })
</script>

<template>
  <div class="space-y-4 min-h-[300px]">
    <UFormField label="Name der Ausschreibung" help="Geben Sie einen aussagekräftigen Namen an.">
      <UInput v-model="name" placeholder="z.B. IT-Dienstleistungen 2026" class="w-full" size="lg" />
    </UFormField>
  </div>
</template>
