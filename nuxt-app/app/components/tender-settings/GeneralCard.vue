<script setup lang="ts">
import TenderSettingsConsiderationYearsModal from './ConsiderationYearsModal.vue'
import TenderSettingsConsiderationYearsRow from './ConsiderationYearsRow.vue'
import TenderSettingsCloneTenderModal from './CloneTenderModal.vue'
import TenderSettingsDeleteTenderModal from './DeleteTenderModal.vue'
import TenderSettingsPaletteCard from './PaletteCard.vue'
import TenderSettingsPaletteColorModal from './PaletteColorModal.vue'
import TenderSettingsRenameTenderModal from './RenameTenderModal.vue'
import TenderSettingsScoreModal from './ScoreModal.vue'
import TenderSettingsScoreRangeRow from './ScoreRangeRow.vue'

import type { TenderSettings } from '../../../shared/types/tenders'

const props = defineProps<{
  tenderId: string
  tenderName: string
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
  errorMessage: actionErrorMessage,
  isSaving: isActionSaving,
  renameTender,
  cloneTender,
  deleteTender,
  clearError: clearActionError
} = useTenderGeneralActions(props.tenderId)

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
const isRenameModalOpen = ref(false)
const renameTenderName = ref('')
const isCloneModalOpen = ref(false)
const cloneTenderName = ref('')
const isDeleteModalOpen = ref(false)
const deleteConfirmationName = ref('')

function openRenameTenderModal() {
  clearActionError()
  renameTenderName.value = props.tenderName
  isRenameModalOpen.value = true
}

function openCloneTenderModal() {
  clearActionError()
  cloneTenderName.value = `Kopie von ${props.tenderName}`
  isCloneModalOpen.value = true
}

function openDeleteTenderModal() {
  clearActionError()
  deleteConfirmationName.value = ''
  isDeleteModalOpen.value = true
}

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

async function submitRenameTender() {
  await renameTender(renameTenderName.value.trim())
  isRenameModalOpen.value = false
}

async function submitCloneTender() {
  await cloneTender(cloneTenderName.value.trim())
  isCloneModalOpen.value = false
}

async function submitDeleteTender() {
  await deleteTender()
  isDeleteModalOpen.value = false
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

    <UCard class="xl:col-span-2">
      <template #header>
        <div class="space-y-1">
          <h3 class="font-semibold">Ausschreibung</h3>
          <p class="text-sm ui-text-muted">
            Verwalten Sie den Namen der Ausschreibung, erstellen Sie einen Strukturklon oder blenden Sie die Ausschreibung aus.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <h4 class="font-medium">Ausschreibung umbenennen</h4>
            <p class="text-sm ui-text-muted">
              Der Name der Ausschreibung kann jederzeit angepasst werden.
            </p>
          </div>

          <UButton
            icon="i-lucide-pencil-line"
            color="neutral"
            variant="outline"
            @click="openRenameTenderModal"
          >
            Umbenennen
          </UButton>
        </div>

        <div class="flex items-start justify-between gap-4 border-t ui-border pt-4">
          <div class="space-y-1">
            <h4 class="font-medium">Ausschreibung klonen</h4>
            <p class="text-sm ui-text-muted">
              Klont die Struktur der Ausschreibung inklusive Settings, Abschnitten, Kostenblöcken und Anbietern. Bewertungsdaten werden nicht übernommen.
            </p>
          </div>

          <UButton
            icon="i-lucide-copy"
            color="neutral"
            variant="outline"
            @click="openCloneTenderModal"
          >
            Klonen
          </UButton>
        </div>

        <div class="flex items-start justify-between gap-4 border-t ui-border pt-4">
          <div class="space-y-1">
            <h4 class="font-medium">Ausschreibung löschen</h4>
            <p class="text-sm ui-text-muted">
              Die Ausschreibung wird aus der Oberfläche entfernt, bleibt aber in der Datenbank erhalten.
            </p>
          </div>

          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="outline"
            @click="openDeleteTenderModal"
          >
            Löschen
          </UButton>
        </div>
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
      v-model:fill-color="editingPaletteFillColor"
      v-model:text-color="editingPaletteTextColor"
      @submit="savePaletteColor"
    />

    <TenderSettingsRenameTenderModal
      v-model:open="isRenameModalOpen"
      v-model:name="renameTenderName"
      :is-saving="isActionSaving"
      @submit="submitRenameTender"
    />

    <TenderSettingsCloneTenderModal
      v-model:open="isCloneModalOpen"
      v-model:name="cloneTenderName"
      :is-saving="isActionSaving"
      @submit="submitCloneTender"
    />

    <TenderSettingsDeleteTenderModal
      v-model:open="isDeleteModalOpen"
      v-model:confirmation-name="deleteConfirmationName"
      :tender-name="props.tenderName"
      :is-saving="isActionSaving"
      @submit="submitDeleteTender"
    />

    <div class="xl:col-span-2 space-y-3">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        :description="errorMessage"
      />

      <UAlert
        v-if="actionErrorMessage"
        color="error"
        variant="subtle"
        :description="actionErrorMessage"
      />
    </div>
  </div>
</template>
