<script setup lang="ts">
import TenderSettingsConsiderationYearsModal from './ConsiderationYearsModal.vue'
import TenderSettingsConsiderationYearsRow from './ConsiderationYearsRow.vue'
import TenderSettingsPaletteCard from './PaletteCard.vue'
import TenderSettingsPaletteColorModal from './PaletteColorModal.vue'
import TenderSettingsScoreModal from './ScoreModal.vue'
import TenderSettingsScoreRangeRow from './ScoreRangeRow.vue'

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

const {
  isScoreModalOpen,
  editingScoreRange,
  isConsiderationYearsModalOpen,
  editingConsiderationYears,
  isColorModalOpen,
  editingPaletteIndex,
  editingPaletteFillColor,
  editingPaletteTextColor,
  openScoreModal,
  closeScoreModal,
  openConsiderationYearsModal,
  closeConsiderationYearsModal,
  openCreatePaletteModal,
  openPaletteModal,
  closePaletteModal
} = useTenderGeneralSettingsDialogs(() => scoreRange.value, () => considerationYears.value, () => chartPalette.value.length)

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
  const nextEntry = {
    fillColor: editingPaletteFillColor.value,
    textColor: editingPaletteTextColor.value
  }

  if (editingPaletteIndex.value === null) {
    addPaletteColor(nextEntry)
  } else {
    updatePaletteColor(editingPaletteIndex.value, nextEntry)
  }

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
        <TenderSettingsScoreRangeRow
          :score-range="scoreRange"
          @edit="openScoreModal"
        />

        <TenderSettingsConsiderationYearsRow
          :consideration-years="considerationYears"
          @edit="openConsiderationYearsModal"
        />

        <p class="text-sm ui-text-muted">
          Bewertungsskala und Betrachtungszeitraum werden jeweils in einem eigenen Bearbeitungsdialog per Slider angepasst.
        </p>
      </div>
    </UCard>

    <TenderSettingsPaletteCard
      :chart-palette="chartPalette"
      @add="openCreatePaletteModal"
      @edit="openPaletteModal"
      @remove="removePaletteColor"
    />

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
      v-model:fill-color="editingPaletteFillColor"
      v-model:text-color="editingPaletteTextColor"
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
