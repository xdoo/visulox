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
  title: () => {
    const ausschreibungName = ausschreibung.value?.name || 'Ausschreibung'
    return `${ausschreibungName} - Kriterienkatalog`
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        Kriterienkatalog
      </h2>
      <p class="ui-text-muted">
        Ausschreibung {{ ausschreibung?.name || ausschreibungId }}.
      </p>
    </div>

    <div class="flex h-96 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400">
      Inhalte für den Kriterienkatalog dieser Ausschreibung folgen später.
    </div>
  </div>
</template>
