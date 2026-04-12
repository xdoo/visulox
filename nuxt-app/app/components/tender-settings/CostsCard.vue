<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'

import { tenderCostBlockTypeLabels } from '../../../shared/constants/cost-blocks'

import type { CostBlockSettingsRow } from '../../composables/useTenderCostBlocksSettings'
import type { TenderCostBlock } from '../../../shared/types/tenders'

const props = defineProps<{
  tenderId: string
  costBlocks: TenderCostBlock[]
}>()

const {
  errorMessage,
  rows,
  isModalOpen,
  modalMode,
  selectedCostBlock,
  pendingAction,
  form,
  canSave,
  openCreateModal,
  openEditModal,
  handleSubmit,
  handleDelete
} = useTenderCostBlocksSettings(props.tenderId, computed(() => props.costBlocks))

const columns: TableColumn<CostBlockSettingsRow>[] = [
  {
    accessorKey: 'name',
    header: 'Bezeichnung'
  },
  {
    id: 'type',
    header: 'Kostenart'
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
          <h3 class="font-semibold">Kostenblöcke</h3>
          <p class="text-sm ui-text-muted">
            Verwalten Sie die Kostenblöcke und ihre Kostenart für diese Ausschreibung.
          </p>
        </div>

        <UTooltip text="Kostenblock hinzufügen">
          <UButton
            icon="i-lucide-plus"
            color="primary"
            aria-label="Kostenblock hinzufügen"
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
        Für diese Ausschreibung sind noch keine Kostenblöcke vorhanden.
      </div>

      <UTable v-else :data="rows" :columns="columns" class="flex-1">
        <template #type-cell="{ row }">
          {{ tenderCostBlockTypeLabels[row.original.type] }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="outline"
              aria-label="Kostenblock bearbeiten"
              @click="openEditModal(row.original)"
            />

            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="outline"
              aria-label="Kostenblock löschen"
              :loading="pendingAction === `delete:${row.original.id}`"
              @click="handleDelete(row.original)"
            />
          </div>
        </template>
      </UTable>

      <p v-if="errorMessage" class="text-sm text-error">
        {{ errorMessage }}
      </p>
    </div>

    <TenderSettingsCostBlockModal
      v-model:open="isModalOpen"
      v-model:name="form.name"
      v-model:cost-block-type="form.type"
      :mode="modalMode"
      :selected-cost-block="selectedCostBlock"
      :pending-action="pendingAction"
      :can-save="canSave"
      @submit="handleSubmit"
    />
  </UCard>
</template>
