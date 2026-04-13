<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { PaletteDialogRow } from '../../composables/useTenderGeneralSettingsDialogs'
import type { TenderSettings } from '../../../shared/types/tenders'

const props = defineProps<{
  tenderId: string
  settings: TenderSettings
}>()

const {
  errorMessage,
  scoreRange,
  considerationYears,
  chartPalette,
  isSaving,
  updatePaletteColor,
  addPaletteColor,
  removePaletteColor,
  save
} = useTenderGeneralSettings(props.tenderId, () => props.settings)

interface PaletteRow {
  color: string
  index: number
}

const {
  isScoreModalOpen,
  editingScoreRange,
  isConsiderationYearsModalOpen,
  editingConsiderationYears,
  isColorModalOpen,
  editingPaletteIndex,
  editingPaletteColor,
  openScoreModal,
  closeScoreModal,
  openConsiderationYearsModal,
  closeConsiderationYearsModal,
  openPaletteModal,
  closePaletteModal
} = useTenderGeneralSettingsDialogs(() => scoreRange.value, () => considerationYears.value)

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
  return chartPalette.value.map((color, index) => ({
    color,
    index
  }))
})

async function saveScoreRange() {
  scoreRange.value = [...editingScoreRange.value] as [number, number]
  closeScoreModal()
  await save()
}

async function saveConsiderationYears() {
  considerationYears.value = editingConsiderationYears.value
  closeConsiderationYearsModal()
  await save()
}

async function savePaletteColor() {
  if (editingPaletteIndex.value === null) {
    return
  }

  updatePaletteColor(editingPaletteIndex.value, editingPaletteColor.value)
  closePaletteModal()
  await save()
}
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-2">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <h3 class="font-semibold">Allgemeine Bewertungsparameter</h3>
          <p class="text-sm ui-text-muted">
            Legen Sie zentrale Rahmenwerte für Bewertung und Betrachtungszeitraum dieser Ausschreibung fest.
          </p>
        </div>
      </template>

      <div class="space-y-4">
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
                <UInput :model-value="String(scoreRange[0])" disabled />
              </UFormField>

              <UFormField label="Bis">
                <UInput :model-value="String(scoreRange[1])" disabled />
              </UFormField>
            </div>
          </div>

          <UTooltip text="Bewertungsskala bearbeiten">
            <UButton
              icon="i-lucide-sliders-horizontal"
              color="neutral"
              variant="outline"
              aria-label="Bewertungsskala bearbeiten"
              @click="openScoreModal"
            />
          </UTooltip>
        </div>

        <div class="flex items-start justify-between gap-4 rounded-lg border ui-border p-4">
          <div class="flex-1 space-y-4">
            <div class="space-y-1">
              <h4 class="font-medium">Betrachtungszeitraum</h4>
              <p class="text-sm ui-text-muted">
                Legen Sie fest, über wie viele Jahre nach Projektende die Kosten betrachtet werden.
              </p>
            </div>

            <UFormField label="Zeitraum">
              <UInput :model-value="`${considerationYears} Jahre`" disabled />
            </UFormField>
          </div>

          <UTooltip text="Betrachtungszeitraum bearbeiten">
            <UButton
              icon="i-lucide-calendar-range"
              color="neutral"
              variant="outline"
              aria-label="Betrachtungszeitraum bearbeiten"
              @click="openConsiderationYearsModal"
            />
          </UTooltip>
        </div>

        <p class="text-sm ui-text-muted">
          Bewertungsskala und Betrachtungszeitraum werden jeweils in einem eigenen Bearbeitungsdialog per Slider angepasst.
        </p>
      </div>
    </UCard>

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
              @click="addPaletteColor"
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
                @click="openPaletteModal(row.original as PaletteDialogRow)"
              />

              <UButton
                icon="i-lucide-trash-2"
                color="neutral"
                variant="outline"
                aria-label="Farbe entfernen"
                :disabled="chartPalette.length <= 1"
                @click="removePaletteColor(row.original.index)"
              />
            </div>
          </template>
        </UTable>
      </div>
    </UCard>

    <TenderSettingsScoreModal
      v-model:open="isScoreModalOpen"
      v-model:score-range="editingScoreRange"
      :is-saving="isSaving"
      @submit="saveScoreRange"
    />

    <TenderSettingsConsiderationYearsModal
      v-model:open="isConsiderationYearsModalOpen"
      v-model:consideration-years="editingConsiderationYears"
      :is-saving="isSaving"
      @submit="saveConsiderationYears"
    />

    <TenderSettingsPaletteColorModal
      v-model:open="isColorModalOpen"
      v-model:color="editingPaletteColor"
      @submit="savePaletteColor"
    />

    <div class="xl:col-span-2 space-y-3">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        :description="errorMessage"
      />
    </div>
  </div>
</template>
