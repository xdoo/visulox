<script setup lang="ts">
useSeoMeta({
  title: 'Ausschreibungen'
})

const isNewTenderModalOpen = ref(false)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Übersicht Ausschreibungen</h2>
        <p class="text-gray-500 dark:text-gray-400">Verwalten Sie Ihre aktuellen Ausschreibungen und Angebote.</p>
      </div>
      <UButton icon="i-heroicons-plus" size="lg" @click="isNewTenderModalOpen = true">
        Neue Ausschreibung
      </UButton>
    </div>

    <div class="h-96 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-gray-400 font-medium italic">
      Liste der Ausschreibungen (Platzhalter)
    </div>

    <NewTenderModal v-model:open="isNewTenderModalOpen" />
  </div>
</template>
