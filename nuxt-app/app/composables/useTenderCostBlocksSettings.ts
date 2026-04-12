import { computed, toValue } from 'vue'

import { useEditableSettingsModal } from './useEditableSettingsModal'
import { useTenderCostBlockMutations } from './useTenderCostBlockMutations'

import type { MaybeRefOrGetter } from 'vue'
import type { TenderCostBlock, TenderCostBlockType } from '../../shared/types/tenders'

export interface CostBlockSettingsRow extends TenderCostBlock {}

export function useTenderCostBlocksSettings(
  tenderId: string,
  costBlocks: MaybeRefOrGetter<TenderCostBlock[]>
) {
  const {
    errorMessage,
    addCostBlock,
    updateCostBlock,
    deleteCostBlock,
    clearError
  } = useTenderCostBlockMutations(tenderId)

  const {
    isModalOpen,
    modalMode,
    selectedItemId: selectedCostBlockId,
    pendingAction,
    form,
    openCreateModal,
    openEditModal,
    startPending,
    stopPending
  } = useEditableSettingsModal<CostBlockSettingsRow, { name: string, type: TenderCostBlockType }>({
    createForm: () => ({
      name: '',
      type: 'project'
    }),
    assignForm: (nextForm, costBlock) => {
      nextForm.name = costBlock?.name || ''
      nextForm.type = costBlock?.type || 'project'
    },
    clearError
  })

  const rows = computed(() => toValue(costBlocks))

  const selectedCostBlock = computed(() => {
    return rows.value.find((costBlock) => costBlock.id === selectedCostBlockId.value) || null
  })

  const canSave = computed(() => {
    if (!form.name.trim()) {
      return false
    }

    if (modalMode.value === 'create') {
      return true
    }

    if (!selectedCostBlock.value) {
      return false
    }

    return form.name.trim() !== selectedCostBlock.value.name || form.type !== selectedCostBlock.value.type
  })

  async function handleSubmit() {
    if (!canSave.value) {
      return
    }

    startPending(modalMode.value === 'create' ? 'create' : `save:${selectedCostBlockId.value}`)
    clearError()

    try {
      if (modalMode.value === 'create') {
        await addCostBlock({
          name: form.name.trim(),
          type: form.type
        })
      } else if (selectedCostBlock.value) {
        await updateCostBlock(selectedCostBlock.value.id, {
          name: form.name.trim(),
          type: form.type
        })
      }

      isModalOpen.value = false
    } finally {
      stopPending()
    }
  }

  async function handleDelete(costBlock: CostBlockSettingsRow) {
    startPending(`delete:${costBlock.id}`)
    clearError()

    try {
      await deleteCostBlock(costBlock.id)
    } finally {
      stopPending()
    }
  }

  return {
    errorMessage,
    rows,
    isModalOpen,
    modalMode,
    selectedCostBlockId,
    selectedCostBlock,
    pendingAction,
    form,
    canSave,
    openCreateModal,
    openEditModal,
    handleSubmit,
    handleDelete
  }
}
