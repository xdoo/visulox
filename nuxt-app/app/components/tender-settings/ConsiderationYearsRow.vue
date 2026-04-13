<script setup lang="ts">
const props = defineProps<{
  considerationYears: number
}>()

defineEmits<{
  edit: []
}>()
</script>

<template>
  <div class="flex items-start justify-between gap-4 rounded-lg border ui-border p-4">
    <div class="flex-1 space-y-4">
      <div class="space-y-1">
        <h4 class="font-medium">Betrachtungszeitraum</h4>
        <p class="text-sm ui-text-muted">
          Legen Sie fest, über wie viele Jahre nach Projektende die Kosten betrachtet werden.
        </p>
      </div>

      <UFormField label="Zeitraum">
        <UInput :model-value="`${props.considerationYears} Jahre`" disabled />
      </UFormField>
    </div>

    <UTooltip text="Betrachtungszeitraum bearbeiten">
      <UButton
        icon="i-lucide-calendar-range"
        color="neutral"
        variant="outline"
        aria-label="Betrachtungszeitraum bearbeiten"
        @click="$emit('edit')"
      />
    </UTooltip>
  </div>
</template>

