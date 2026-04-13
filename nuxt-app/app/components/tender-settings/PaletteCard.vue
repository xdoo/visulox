<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { PaletteDialogRow } from '../../composables/useTenderGeneralSettingsDialogs'

interface PaletteRow {
  color: string
  index: number
}

const props = defineProps<{
  chartPalette: string[]
}>()

const emit = defineEmits<{
  add: []
  edit: [row: PaletteDialogRow]
  remove: [index: number]
}>()

const paletteColumns: TableColumn<PaletteRow>[] = [
  {
    id: 'preview',
    header: 'Farbprobe',
    meta: {
      class: {
        th: 'w-28',
        td: 'w-28'
      }
    }
  },
  {
    accessorKey: 'color',
    header: 'Farb-Code'
  },
  {
    id: 'actions',
    header: '',
    meta: {
      class: {
        th: 'w-32',
        td: 'w-32'
      }
    }
  }
]

const paletteRows = computed<PaletteRow[]>(() => {
  return props.chartPalette.map((color, index) => ({
    color,
    index
  }))
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <h3 class="font-semibold">Farbpalette für Diagramme</h3>
          <p class="text-sm ui-text-muted">
            Definieren Sie die globalen Farben, die in Diagrammen für diese Ausschreibung verwendet werden.
          </p>
        </div>

        <UTooltip text="Farbe hinzufügen">
          <UButton
            icon="i-lucide-plus"
            color="primary"
            aria-label="Farbe hinzufügen"
            @click="$emit('add')"
          />
        </UTooltip>
      </div>
    </template>

    <div class="space-y-4">
      <UTable
        :data="paletteRows"
        :columns="paletteColumns"
        class="flex-1"
      >
        <template #preview-cell="{ row }">
          <span
            class="inline-block size-4 rounded-full border ui-border"
            :style="{ backgroundColor: row.original.color }"
          />
        </template>

        <template #color-cell="{ row }">
          <UInput
            :model-value="row.original.color"
            class="w-full"
            disabled
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-palette"
              color="neutral"
              variant="outline"
              aria-label="Farbe bearbeiten"
              @click="$emit('edit', row.original as PaletteDialogRow)"
            />

            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="outline"
              aria-label="Farbe entfernen"
              :disabled="props.chartPalette.length <= 1"
              @click="$emit('remove', row.original.index)"
            />
          </div>
        </template>
      </UTable>
    </div>
  </UCard>
</template>

