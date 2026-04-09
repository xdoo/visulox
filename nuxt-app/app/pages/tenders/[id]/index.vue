<script setup lang="ts">
const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { findTenderById, loadTenders } = useTenders()

await callOnce(async () => {
  await loadTenders()
})

const tender = computed(() => {
  return findTenderById(tenderId.value)
})

useSeoMeta({
  title: () => tender.value?.name || 'Ausschreibung'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        {{ tender?.name || 'Ausschreibung' }}
      </h2>
      <p class="ui-text-muted">
        Detailseite für Ausschreibung {{ tenderId }}.
      </p>
    </div>

    <div class="flex h-96 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400">
      Inhalte für diese Ausschreibung folgen später.
    </div>
  </div>
</template>
