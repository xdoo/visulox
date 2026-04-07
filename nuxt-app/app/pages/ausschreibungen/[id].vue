<script setup lang="ts">
const route = useRoute()
const ausschreibungId = computed(() => String(route.params.id || ''))
const { findAusschreibungById, loadAusschreibungen } = useAusschreibungen()

await callOnce(async () => {
  await loadAusschreibungen()
})

const ausschreibung = computed(() => {
  return findAusschreibungById(ausschreibungId.value)
})

useSeoMeta({
  title: () => ausschreibung.value?.name || 'Ausschreibung'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        {{ ausschreibung?.name || 'Ausschreibung' }}
      </h2>
      <p class="ui-text-muted">
        Detailseite für Ausschreibung {{ ausschreibungId }}.
      </p>
    </div>

    <div class="flex h-96 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400">
      Inhalte für diese Ausschreibung folgen später.
    </div>
  </div>
</template>
