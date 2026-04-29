<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { tenderCostBlockTypeLabels } from '~~/shared/constants/cost-blocks'
import type { VendorCostRow } from '../../composables/useTenderVendorCosts'
import type { VendorCostSummaryItem } from '../../composables/useVendorCostSummaries'
import { useVendorCostGroupInputs } from '../../composables/useVendorCostGroupInputs'

const props = defineProps<{
  title: string
  description: string
  rows: VendorCostRow[]
  summaries: VendorCostSummaryItem[]
}>()

const emit = defineEmits<{
  updateAmount: [costBlockId: string, value: string]
  updateComment: [costBlockId: string, value: string]
}>()

const {
  focusCostBlock,
  clearFocusedCostBlock,
  getInputValue,
  getSummaryValue,
  handleEnter
} = useVendorCostGroupInputs()

const columns: TableColumn<VendorCostRow>[] = [
  {
    accessorKey: 'name',
    header: 'Kostenblock'
  },
  {
    id: 'type',
    header: 'Kostenart'
  },
  {
    id: 'amount',
    header: 'Betrag',
    meta: {
      class: {
        th: 'w-40 text-right',
        td: 'w-40'
      }
    }
  },
  {
    id: 'comment',
    header: '',
    meta: {
      class: {
        th: 'w-12 text-right',
        td: 'w-12 text-right'
      }
    }
  }
]

const isCommentModalOpen = ref(false)
const selectedCostBlockId = ref('')
const commentDraft = ref('')

const selectedRow = computed(() => {
  return props.rows.find((row) => row.costBlockId === selectedCostBlockId.value) || null
})

const canSaveComment = computed(() => {
  return selectedRow.value !== null && selectedRow.value.kommentar !== commentDraft.value
})

function openCommentModal(row: VendorCostRow) {
  selectedCostBlockId.value = row.costBlockId
  commentDraft.value = row.kommentar
  isCommentModalOpen.value = true
}

function closeCommentModal() {
  isCommentModalOpen.value = false
  selectedCostBlockId.value = ''
  commentDraft.value = ''
}

function saveComment() {
  if (!selectedRow.value) {
    return
  }

  emit('updateComment', selectedRow.value.costBlockId, commentDraft.value)
  closeCommentModal()
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h3 class="font-semibold">{{ props.title }}</h3>
        <p class="text-sm ui-text-muted">
          {{ props.description }}
        </p>
      </div>
    </template>

    <div
      v-if="props.rows.length === 0"
      class="flex h-32 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
    >
      Keine Kostenblöcke in dieser Gruppe vorhanden.
    </div>

    <UTable
      v-else
      :data="props.rows"
      :columns="columns"
      class="flex-1"
    >
      <template #type-cell="{ row }">
        {{ tenderCostBlockTypeLabels[row.original.type] }}
      </template>

      <template #amount-cell="{ row }">
        <UFieldGroup class="w-full">
          <UInput
            :model-value="getInputValue(row.original)"
            inputmode="decimal"
            placeholder="0"
            class="w-full text-right"
            data-vendor-cost-input="true"
            @focus="focusCostBlock(row.original.costBlockId)"
            @blur="clearFocusedCostBlock"
            @keydown.enter="handleEnter"
            @update:model-value="$emit('updateAmount', row.original.costBlockId, String($event ?? ''))"
          />

          <span class="flex items-center px-3 ui-text-muted">
            <UIcon name="i-lucide-euro" class="size-4" />
          </span>
        </UFieldGroup>
      </template>

      <template #comment-cell="{ row }">
        <UTooltip :text="row.original.kommentar ? 'Kommentar bearbeiten' : 'Kommentar hinzufügen'">
          <UButton
            icon="i-lucide-message-square-quote"
            :color="row.original.kommentar ? 'primary' : 'neutral'"
            :variant="row.original.kommentar ? 'soft' : 'ghost'"
            :aria-label="`Kommentar fuer ${row.original.name} bearbeiten`"
            @click="openCommentModal(row.original)"
          />
        </UTooltip>
      </template>
    </UTable>

    <div
      v-if="props.rows.length > 0"
      class="mt-4 flex items-center justify-between border-t ui-border pl-4 pr-[25px] pt-4"
    >
      <div class="w-full space-y-2">
        <div
          v-for="summary in props.summaries"
          :key="summary.label"
          class="flex items-center justify-between"
        >
          <div class="text-sm font-medium">
            {{ summary.label }}
          </div>

          <div class="flex items-center gap-2 text-base font-semibold">
            <span>{{ getSummaryValue(summary.value) }}</span>
            <UIcon name="i-lucide-euro" class="size-4 ui-text-muted" />
          </div>
        </div>
      </div>
    </div>
  </UCard>

  <UModal
    v-model:open="isCommentModalOpen"
    title="Kommentar zu Kostenblock"
    :description="selectedRow ? selectedRow.name : ''"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <UFormField label="Kommentar">
        <UTextarea
          v-model="commentDraft"
          class="w-full"
          autoresize
          :rows="6"
          placeholder="Kommentar zum Kostenblock eingeben"
        />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <UButton color="neutral" variant="ghost" @click="closeCommentModal">
          Abbrechen
        </UButton>
        <UButton
          icon="i-lucide-save"
          :disabled="!canSaveComment"
          @click="saveComment"
        >
          Übernehmen
        </UButton>
      </div>
    </template>
  </UModal>
</template>
