<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { TenderSection, TenderVendor } from '../../../shared/types/tenders'

const props = defineProps<{
  tenderId: string
  vendors: TenderVendor[]
  sections: TenderSection[]
}>()

type VendorRow = TenderVendor & {
  hasImportedQuestions: boolean
}

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedVendorId = ref('')
const pendingAction = ref('')
const form = reactive({
  name: ''
})

const {
  errorMessage,
  addVendor,
  updateVendor,
  deleteVendor,
  clearError
} = useTenderSettings(props.tenderId)

const deleteLockReason = 'Nicht verfügbar, weil für diesen Anbieter bereits Fragen importiert wurden.'

const rows = computed<VendorRow[]>(() => {
  return props.vendors.map((vendor) => ({
    ...vendor,
    hasImportedQuestions: props.sections.some((section) => {
      return section.questionsByVendor.some((entry) => entry.vendorId === vendor.id && entry.questions.length > 0)
    })
  }))
})

const columns: TableColumn<VendorRow>[] = [
  {
    accessorKey: 'name',
    header: 'Anbieter'
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

const selectedVendor = computed(() => {
  return rows.value.find((vendor) => vendor.id === selectedVendorId.value) || null
})

const modalTitle = computed(() => {
  return modalMode.value === 'create' ? 'Anbieter hinzufügen' : 'Anbieter bearbeiten'
})

const canSave = computed(() => {
  if (!form.name.trim()) {
    return false
  }

  if (modalMode.value === 'create') {
    return true
  }

  if (!selectedVendor.value) {
    return false
  }

  return form.name.trim() !== selectedVendor.value.name
})

function openCreateModal() {
  modalMode.value = 'create'
  selectedVendorId.value = ''
  form.name = ''
  clearError()
  isModalOpen.value = true
}

function openEditModal(vendor: VendorRow) {
  modalMode.value = 'edit'
  selectedVendorId.value = vendor.id
  form.name = vendor.name
  clearError()
  isModalOpen.value = true
}

async function handleSubmit() {
  if (!canSave.value) {
    return
  }

  pendingAction.value = modalMode.value === 'create' ? 'create' : `save:${selectedVendorId.value}`
  clearError()

  try {
    if (modalMode.value === 'create') {
      await addVendor({
        name: form.name.trim()
      })
    } else if (selectedVendor.value) {
      await updateVendor(selectedVendor.value.id, {
        name: form.name.trim()
      })
    }

    isModalOpen.value = false
  } finally {
    pendingAction.value = ''
  }
}

async function handleDelete(vendor: VendorRow) {
  pendingAction.value = `delete:${vendor.id}`
  clearError()

  try {
    await deleteVendor(vendor.id)
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
          <h3 class="font-semibold">Anbieter</h3>
          <p class="text-sm ui-text-muted">
            Verwalten Sie die Anbieter für diese Ausschreibung.
          </p>
        </div>

        <UTooltip text="Anbieter hinzufügen">
          <UButton
            icon="i-lucide-plus"
            color="primary"
            aria-label="Anbieter hinzufügen"
            @click="openCreateModal"
          />
        </UTooltip>
      </div>
    </template>

    <div class="space-y-4">
      <div
        v-if="rows.length === 0"
        class="flex h-40 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
      >
        Für diese Ausschreibung sind noch keine Anbieter vorhanden.
      </div>

      <UTable
        v-else
        :data="rows"
        :columns="columns"
        class="flex-1"
      >
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="outline"
              aria-label="Anbieter bearbeiten"
              @click="openEditModal(row.original)"
            />

            <UTooltip :text="deleteLockReason" :disabled="!row.original.hasImportedQuestions">
              <span class="inline-flex">
                <UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="outline"
                  aria-label="Anbieter löschen"
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
      description="Pflegen Sie die Anbieter dieser Ausschreibung."
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Anbieter">
            <UInput
              v-model="form.name"
              class="w-full"
              placeholder="Name des Anbieters"
              :disabled="pendingAction !== ''"
            />
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
            :loading="pendingAction === 'create' || pendingAction === `save:${selectedVendorId}`"
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
