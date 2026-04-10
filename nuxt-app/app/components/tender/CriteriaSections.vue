<script setup lang="ts">
import type { TenderSection } from '../../../shared/types/tenders'

const props = defineProps<{
  sections: TenderSection[]
  vendorId: string
  maxPoints: number
}>()

const hasSections = computed(() => props.sections.length > 0)
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="!hasSections"
      class="flex h-48 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
    >
      Für diese Ausschreibung sind noch keine Kriterienkatalog-Abschnitte vorhanden.
    </div>

    <div v-else class="grid gap-4">
      <TenderCriteriaSection
        v-for="section in sections"
        :key="section.id"
        :section="section"
        :vendor-id="vendorId"
        :max-points="maxPoints"
      />
    </div>
  </div>
</template>
