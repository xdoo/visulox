<script setup lang="ts">
import AusschreibungCriteriaSection from './AusschreibungCriteriaSection.vue'

import type { AusschreibungSection } from '../../shared/types/ausschreibungen'

const props = defineProps<{
  sections: AusschreibungSection[]
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
      <AusschreibungCriteriaSection
        v-for="section in sections"
        :key="section.id"
        :section="section"
      />
    </div>
  </div>
</template>
