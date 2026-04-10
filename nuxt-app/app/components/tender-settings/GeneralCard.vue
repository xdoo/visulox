<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { TenderSettings } from '../../../shared/types/tenders'

const props = defineProps<{
  tenderId: string
  settings: TenderSettings
}>()

const {
  errorMessage,
  scoreRange,
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

const isScoreModalOpen = ref(false)
const editingScoreRange = ref<[number, number]>([...scoreRange.value] as [number, number])
const isColorModalOpen = ref(false)
const editingPaletteIndex = ref<number | null>(null)
const editingPaletteColor = ref('')

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

function openPaletteModal(row: PaletteRow) {
  editingPaletteIndex.value = row.index
  editingPaletteColor.value = row.color
  isColorModalOpen.value = true
}

function openScoreModal() {
  editingScoreRange.value = [...scoreRange.value] as [number, number]
  isScoreModalOpen.value = true
}

async function saveScoreRange() {
  scoreRange.value = [...editingScoreRange.value] as [number, number]
  isScoreModalOpen.value = false
  await save()
}

async function savePaletteColor() {
  if (editingPaletteIndex.value === null) {
    return
  }

  updatePaletteColor(editingPaletteIndex.value, editingPaletteColor.value)
  isColorModalOpen.value = false
  await save()
}
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-2">
    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <h3 class="font-semibold">Bewertungsskala</h3>
            <p class="text-sm ui-text-muted">
              Legen Sie fest, in welchem Bereich Bewertungen für diese Ausschreibung erfolgen.
            </p>
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
      </template>

      <div class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Von">
            <UInput :model-value="String(scoreRange[0])" disabled />
          </UFormField>

          <UFormField label="Bis">
            <UInput :model-value="String(scoreRange[1])" disabled />
          </UFormField>
        </div>

        <p class="text-sm ui-text-muted">
          Die Grenzen der Bewertungsskala werden im Bearbeitungsdialog über einen Slider angepasst.
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
                @click="openPaletteModal(row.original)"
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

    <UModal
      v-model:open="isScoreModalOpen"
      title="Bewertungsskala bearbeiten"
      description="Wählen Sie den Wertebereich für die Bewertung dieser Ausschreibung."
    >
      <template #body>
        <div class="space-y-6">
          <USlider
            v-model="editingScoreRange"
            :min="0"
            :max="100"
            :step="1"
            color="primary"
          />

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Von">
              <UInput :model-value="String(editingScoreRange[0])" disabled />
            </UFormField>

            <UFormField label="Bis">
              <UInput :model-value="String(editingScoreRange[1])" disabled />
            </UFormField>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-between gap-2">
          <UButton color="neutral" variant="ghost" @click="isScoreModalOpen = false">
            Abbrechen
          </UButton>
          <UButton
            icon="i-lucide-save"
            color="primary"
            :loading="isSaving"
            @click="saveScoreRange"
          >
            Speichern
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="isColorModalOpen"
      title="Farbe bearbeiten"
      description="Wählen Sie eine Farbe aus oder geben Sie einen Hex-Code direkt ein."
    >
      <template #body>
        <div class="space-y-4">
          <div class="flex justify-center">
            <UColorPicker v-model="editingPaletteColor" />
          </div>

          <UFormField label="Farb-Code">
            <UInput
              v-model="editingPaletteColor"
              class="w-full"
              placeholder="#0D57A6"
            />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-between gap-2">
          <UButton color="neutral" variant="ghost" @click="isColorModalOpen = false">
            Abbrechen
          </UButton>
          <UButton
            icon="i-lucide-save"
            color="primary"
            @click="savePaletteColor"
          >
            Speichern
          </UButton>
        </div>
      </template>
    </UModal>

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
