<script setup lang="ts">
import { ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { tenderCostBlockTypeLabels } from '../../../shared/constants/cost-blocks'
import { formatVendorCostInputValue } from '../../composables/useTenderVendorCosts'
import type { VendorCostRow } from '../../composables/useTenderVendorCosts'

const props = defineProps<{
  title: string
  description: string
  rows: VendorCostRow[]
}>()

defineEmits<{
  updateAmount: [costBlockId: string, value: string]
}>()

const focusedCostBlockId = ref('')

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
  }
]

function getInputValue(row: VendorCostRow) {
  return focusedCostBlockId.value === row.costBlockId
    ? row.amount
    : formatVendorCostInputValue(row.amount)
}

function handleEnter(event: KeyboardEvent) {
  const currentInput = event.currentTarget as HTMLInputElement | null

  if (!currentInput) {
    return
  }

  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-vendor-cost-input="true"]'))
  const currentIndex = inputs.indexOf(currentInput)
  const nextInput = currentIndex >= 0 ? inputs[currentIndex + 1] : null

  if (!nextInput) {
    return
  }

  event.preventDefault()
  nextInput.focus()
  nextInput.select()
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
            @focus="focusedCostBlockId = row.original.costBlockId"
            @blur="focusedCostBlockId = ''"
            @keydown.enter="handleEnter"
            @update:model-value="$emit('updateAmount', row.original.costBlockId, String($event ?? ''))"
          />

          <span class="flex items-center px-3 ui-text-muted">
            <UIcon name="i-lucide-euro" class="size-4" />
          </span>
        </UFieldGroup>
      </template>
    </UTable>
  </UCard>
</template>
