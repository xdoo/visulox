<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { SectionSettingsRow } from '../../composables/useTenderSectionsSettings'
import type { TenderSection } from '../../../shared/types/tenders'

const props = defineProps<{
  tenderId: string
  sections: TenderSection[]
}>()

const deleteLockReason = 'Nicht verfügbar, weil für diesen Abschnitt bereits Fragen importiert wurden.'

const {
  errorMessage,
  rows,
  totalWeight,
  isModalOpen,
  modalMode,
  selectedSection,
  pendingAction,
  form,
  modalLockReason,
  canSave,
  openCreateModal,
  openEditModal,
  handleSubmit,
  handleDelete
} = useTenderSectionsSettings(props.tenderId, computed(() => props.sections))

const columns: TableColumn<SectionSettingsRow>[] = [
  {
    accessorKey: 'name',
    header: 'Abschnitt',
    meta: {
      class: {
        th: 'w-1/4 whitespace-normal',
        td: 'w-1/4 whitespace-normal break-words'
      }
    }
  },
  {
    accessorKey: 'description',
    header: 'Beschreibung',
    meta: {
      class: {
        th: 'w-2/5 whitespace-normal',
        td: 'w-2/5 whitespace-normal break-words'
      }
    }
  },
  {
    accessorKey: 'evaluators',
    header: 'Bewerter',
    meta: {
      class: {
        th: 'w-1/5 whitespace-normal',
        td: 'w-1/5 whitespace-normal break-words'
      }
    }
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
        class="w-full table-fixed"
      >
        <template #description-cell="{ row }">
          <UTooltip
            :text="row.original.description || 'Keine Beschreibung erfasst'"
            :disabled="!row.original.description"
          >
            <span class="block whitespace-pre-line break-words text-sm ui-text-muted">
              {{ row.original.description || '–' }}
            </span>
          </UTooltip>
        </template>

        <template #evaluators-cell="{ row }">
          <UTooltip
            :text="row.original.evaluators || 'Keine Bewerter erfasst'"
            :disabled="!row.original.evaluators"
          >
            <span class="block whitespace-pre-line break-words text-sm ui-text-muted">
              {{ row.original.evaluators || '–' }}
            </span>
          </UTooltip>
        </template>

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

    <TenderSettingsSectionModal
      v-model:open="isModalOpen"
      v-model:name="form.name"
      v-model:weight="form.weight"
      v-model:evaluators="form.evaluators"
      v-model:description="form.description"
      :mode="modalMode"
      :selected-section="selectedSection"
      :pending-action="pendingAction"
      :can-save="canSave"
      :modal-lock-reason="modalLockReason"
      @submit="handleSubmit"
    />
  </UCard>
</template>
