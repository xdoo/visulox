<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { TenderSection } from '../../../shared/types/tenders'

const props = defineProps<{
  tenderId: string
  sections: TenderSection[]
}>()

type SectionRow = TenderSection & {
  hasImportedQuestions: boolean
}

const toast = useToast()
const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedSectionId = ref('')
const pendingAction = ref('')
const form = reactive({
  name: '',
  weight: ''
})

const {
  errorMessage,
  addSection,
  updateSection,
  deleteSection,
  clearError
} = useTenderSettings(props.tenderId)

const deleteLockReason = 'Nicht verfügbar, weil für diesen Abschnitt bereits Fragen importiert wurden.'
const weightLockReason = 'Das Gewicht kann nicht geändert werden, weil für diesen Abschnitt bereits Fragen importiert wurden. Das Abschnittsgewicht gilt für die gesamte Ausschreibung.'

const rows = computed<SectionRow[]>(() => {
  return props.sections.map((section) => ({
    ...section,
    hasImportedQuestions: section.questionsByVendor.some((entry) => entry.questions.length > 0)
  }))
})

const totalWeight = computed(() => {
  return props.sections.reduce((sum, section) => sum + section.weight, 0)
})

const columns: TableColumn<SectionRow>[] = [
  {
    accessorKey: 'name',
    header: 'Abschnitt'
  },
  {
    accessorKey: 'weight',
    header: 'Gewicht',
    meta: {
      class: {
        th: 'w-28 text-right',
        td: 'w-28 text-right font-medium'
      }
    }
  },
  {
    id: 'actions',
    header: '',
    meta: {
      class: {
        th: 'w-28',
        td: 'w-28'
      }
    }
  }
]

const selectedSection = computed(() => {
  return rows.value.find((section) => section.id === selectedSectionId.value) || null
})

const modalTitle = computed(() => {
  return modalMode.value === 'create' ? 'Abschnitt hinzufügen' : 'Abschnitt bearbeiten'
})

const modalDescription = computed(() => {
  return modalMode.value === 'create'
    ? 'Fügen Sie einen neuen Abschnitt zum Kriterienkatalog hinzu.'
    : 'Bearbeiten Sie Name und Gewicht des Abschnitts.'
})

const modalLockReason = computed(() => {
  return selectedSection.value?.hasImportedQuestions ? weightLockReason : ''
})

const canSave = computed(() => {
  const parsedWeight = parseWeight(form.weight)

  if (!form.name.trim() || parsedWeight === null) {
    return false
  }

  if (modalMode.value === 'create') {
    return true
  }

  if (!selectedSection.value) {
    return false
  }

  return form.name.trim() !== selectedSection.value.name || parsedWeight !== selectedSection.value.weight
})

function parseWeight(value: string) {
  const normalizedValue = Number(value)
  return Number.isInteger(normalizedValue) ? normalizedValue : null
}

function setForm(section?: TenderSection) {
  form.name = section?.name || ''
  form.weight = section ? String(section.weight) : ''
}

function openCreateModal() {
  modalMode.value = 'create'
  selectedSectionId.value = ''
  setForm()
  clearError()
  isModalOpen.value = true
}

function openEditModal(section: SectionRow) {
  modalMode.value = 'edit'
  selectedSectionId.value = section.id
  setForm(section)
  clearError()
  isModalOpen.value = true
}

function notifyIfWeightTotalIsInvalid(nextTotal: number) {
  if (nextTotal === 100) {
    return
  }

  toast.add({
    title: 'Gewichtssumme ungleich 100%',
    description: `Die Abschnitte wurden gespeichert. Die aktuelle Summe beträgt ${nextTotal}%.`,
    color: 'warning',
    icon: 'i-lucide-triangle-alert'
  })
}

function getNextTotalAfterSave() {
  const parsedWeight = parseWeight(form.weight)

  if (parsedWeight === null) {
    return totalWeight.value
  }

  if (modalMode.value === 'create') {
    return totalWeight.value + parsedWeight
  }

  if (!selectedSection.value) {
    return totalWeight.value
  }

  return totalWeight.value - selectedSection.value.weight + parsedWeight
}

async function handleSubmit() {
  const parsedWeight = parseWeight(form.weight)

  if (!canSave.value || parsedWeight === null) {
    return
  }

  pendingAction.value = modalMode.value === 'create' ? 'create' : `save:${selectedSectionId.value}`
  clearError()

  try {
    const nextTotal = getNextTotalAfterSave()

    if (modalMode.value === 'create') {
      await addSection({
        name: form.name.trim(),
        weight: parsedWeight
      })
    } else if (selectedSection.value) {
      await updateSection(selectedSection.value.id, {
        name: form.name.trim(),
        weight: parsedWeight
      })
    }

    isModalOpen.value = false
    notifyIfWeightTotalIsInvalid(nextTotal)
  } finally {
    pendingAction.value = ''
  }
}

async function handleDelete(section: SectionRow) {
  pendingAction.value = `delete:${section.id}`
  clearError()

  try {
    await deleteSection(section.id)
    notifyIfWeightTotalIsInvalid(totalWeight.value - section.weight)
  } finally {
    pendingAction.value = ''
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <h3 class="font-semibold">Abschnitte</h3>
          <p class="text-sm ui-text-muted">
            Verwalten Sie die Abschnitte des Kriterienkatalogs für diese Ausschreibung.
          </p>
        </div>

        <UTooltip text="Abschnitt hinzufügen">
          <UButton
            icon="i-lucide-plus"
            color="primary"
            aria-label="Abschnitt hinzufügen"
            @click="openCreateModal"
          />
        </UTooltip>
      </div>
    </template>

    <div class="space-y-4">
      <UAlert
        v-if="totalWeight !== 100"
        color="warning"
        variant="subtle"
        title="Gewichtssumme ungleich 100%"
        :description="`Die aktuelle Summe der Abschnittsgewichte beträgt ${totalWeight}%.`"
        icon="i-lucide-triangle-alert"
      />

      <div
        v-if="rows.length === 0"
        class="flex h-40 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
      >
        Für diese Ausschreibung sind noch keine Abschnitte vorhanden.
      </div>

      <UTable
        v-else
        :data="rows"
        :columns="columns"
        class="flex-1"
      >
        <template #weight-cell="{ row }">
          {{ row.original.weight }}%
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="outline"
              aria-label="Abschnitt bearbeiten"
              @click="openEditModal(row.original)"
            />

            <UTooltip :text="deleteLockReason" :disabled="!row.original.hasImportedQuestions">
              <span class="inline-flex">
                <UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="outline"
                  aria-label="Abschnitt löschen"
                  :loading="pendingAction === `delete:${row.original.id}`"
                  :disabled="row.original.hasImportedQuestions"
                  @click="handleDelete(row.original)"
                />
              </span>
            </UTooltip>
          </div>
        </template>
      </UTable>

      <p v-if="errorMessage" class="text-sm text-error">
        {{ errorMessage }}
      </p>
    </div>

    <UModal
      v-model:open="isModalOpen"
      :title="modalTitle"
      :description="modalDescription"
    >
      <template #body>
        <div class="space-y-4">
          <UAlert
            v-if="modalLockReason"
            color="warning"
            variant="subtle"
            :description="modalLockReason"
            icon="i-lucide-lock"
          />

          <UFormField label="Abschnitt">
            <UInput
              v-model="form.name"
              class="w-full"
              placeholder="Titel des Abschnitts"
              :disabled="pendingAction !== ''"
            />
          </UFormField>

          <UFormField label="Gewicht">
            <UTooltip :text="weightLockReason" :disabled="!selectedSection?.hasImportedQuestions">
              <span class="block">
                <UFieldGroup>
                  <UInput
                    v-model="form.weight"
                    class="w-24"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    :disabled="selectedSection?.hasImportedQuestions || pendingAction !== ''"
                  />
                  <UBadge color="neutral" variant="subtle">
                    %
                  </UBadge>
                </UFieldGroup>
              </span>
            </UTooltip>
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-between gap-2">
          <UButton color="neutral" variant="ghost" @click="isModalOpen = false">
            Abbrechen
          </UButton>
          <UButton
            icon="i-lucide-save"
            :loading="pendingAction === 'create' || pendingAction === `save:${selectedSectionId}`"
            :disabled="!canSave"
            @click="handleSubmit"
          >
            Speichern
          </UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>
