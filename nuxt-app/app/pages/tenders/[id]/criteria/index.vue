<script setup lang="ts">
import { getTenderCriteriaCatalogPath, getTenderPath } from '../../../../composables/useTenderPaths'

const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { loadTenders, findTenderById } = useTenders()

await callOnce(async () => {
  await loadTenders()
})

const redirected = ref(false)

watchEffect(() => {
  if (redirected.value) {
    return
  }

  const tender = findTenderById(tenderId.value)
  if (!tender) {
    return
  }

  const firstCatalogId = tender.criteriaCatalogs?.[0]?.id
  redirected.value = true

  if (!firstCatalogId) {
    navigateTo(getTenderPath(tender.id), { replace: true })
    return
  }

  navigateTo(getTenderCriteriaCatalogPath(tender.id, firstCatalogId), { replace: true })
})
</script>

<template>
  <div class="flex h-96 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400">
    Lade Kriterienkatalog ...
  </div>
</template>
