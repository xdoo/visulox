<script setup lang="ts">
const props = defineProps<{
  scoreRange: [number, number]
}>()

defineEmits<{
  edit: []
}>()
</script>

<template>
  <div class="flex items-start justify-between gap-4 rounded-lg border ui-border p-4">
    <div class="flex-1 space-y-4">
      <div class="space-y-1">
        <h4 class="font-medium">Bewertungsskala</h4>
        <p class="text-sm ui-text-muted">
          Legen Sie fest, in welchem Bereich Bewertungen für diese Ausschreibung erfolgen.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Von">
          <UInput :model-value="String(props.scoreRange[0])" disabled />
        </UFormField>

        <UFormField label="Bis">
          <UInput :model-value="String(props.scoreRange[1])" disabled />
        </UFormField>
      </div>
    </div>

    <UTooltip text="Bewertungsskala bearbeiten">
      <UButton
        icon="i-lucide-sliders-horizontal"
        color="neutral"
        variant="outline"
        aria-label="Bewertungsskala bearbeiten"
        @click="$emit('edit')"
      />
    </UTooltip>
  </div>
</template>

