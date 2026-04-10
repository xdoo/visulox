<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { VendorSettingsRow } from '../../composables/useTenderVendorsSettings'
import type { TenderSection, TenderVendor } from '../../../shared/types/tenders'

const props = defineProps<{
  tenderId: string
  vendors: TenderVendor[]
  sections: TenderSection[]
}>()

const deleteLockReason = 'Nicht verfügbar, weil für diesen Anbieter bereits Fragen importiert wurden.'

const {
  errorMessage,
  rows,
  isModalOpen,
  modalMode,
  selectedVendorId,
  selectedVendor,
  pendingAction,
  form,
  canSave,
  openCreateModal,
  openEditModal,
  handleSubmit,
  handleDelete
} = useTenderVendorsSettings(
  props.tenderId,
  computed(() => props.vendors),
  computed(() => props.sections)
)

const columns: TableColumn<VendorSettingsRow>[] = [
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

    <TenderSettingsVendorModal
      v-model:open="isModalOpen"
      v-model:name="form.name"
      :mode="modalMode"
      :selected-vendor="selectedVendor"
      :pending-action="pendingAction"
      :can-save="canSave"
      @submit="handleSubmit"
    />
  </UCard>
</template>
