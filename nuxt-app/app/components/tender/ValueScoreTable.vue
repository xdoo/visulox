<script setup lang="ts">
import type { TenderValueScoreRow } from '../../composables/useTenderValueScore'

const props = defineProps<{
  rows: TenderValueScoreRow[]
  considerationYears: number
  plain?: boolean
  showCalculationIcon?: boolean
}>()
</script>

<template>
  <section v-if="props.plain">
    <TenderValueScoreTableContent
      :rows="props.rows"
      :show-calculation-icon="props.showCalculationIcon"
    />
  </section>

  <UCard v-else>
    <template #header>
      <div class="space-y-1">
        <h3 class="font-semibold text-lg">
          Value Score
        </h3>
        <p class="text-sm ui-text-muted">
          Der Value Score kombiniert Nutzen und Gesamtkosten über den Betrachtungszeitraum von {{ props.considerationYears }} Jahren.
        </p>
      </div>
    </template>

    <TenderValueScoreTableContent
      :rows="props.rows"
      :show-calculation-icon="props.showCalculationIcon"
    />
  </UCard>
</template>
