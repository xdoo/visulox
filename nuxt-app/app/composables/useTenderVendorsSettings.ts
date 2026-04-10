import { computed, toValue } from 'vue'

import { useEditableSettingsModal } from './useEditableSettingsModal'
import { useTenderVendorMutations } from './useTenderVendorMutations'

import type { MaybeRefOrGetter } from 'vue'
import type { TenderSection, TenderVendor } from '../../shared/types/tenders'

export interface VendorSettingsRow extends TenderVendor {
  hasImportedQuestions: boolean
}

export function mapVendorsForSettings(vendors: TenderVendor[], sections: TenderSection[]): VendorSettingsRow[] {
  return vendors.map((vendor) => ({
    ...vendor,
    hasImportedQuestions: sections.some((section) => {
      return section.questionsByVendor.some((entry) => entry.vendorId === vendor.id && entry.questions.length > 0)
    })
  }))
}

export function useTenderVendorsSettings(
  tenderId: string,
  vendors: MaybeRefOrGetter<TenderVendor[]>,
  sections: MaybeRefOrGetter<TenderSection[]>
) {
  const {
    errorMessage,
    addVendor,
    updateVendor,
    deleteVendor,
    clearError
  } = useTenderVendorMutations(tenderId)

  const {
    isModalOpen,
    modalMode,
    selectedItemId: selectedVendorId,
    pendingAction,
    form,
    openCreateModal,
    openEditModal,
    startPending,
    stopPending
  } = useEditableSettingsModal<VendorSettingsRow, { name: string }>({
    createForm: () => ({
      name: ''
    }),
    assignForm: (nextForm, vendor) => {
      nextForm.name = vendor?.name || ''
    },
    clearError
  })

  const rows = computed<VendorSettingsRow[]>(() => {
    return mapVendorsForSettings(toValue(vendors), toValue(sections))
  })

  const selectedVendor = computed(() => {
    return rows.value.find((vendor) => vendor.id === selectedVendorId.value) || null
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

  async function handleSubmit() {
    if (!canSave.value) {
      return
    }

    startPending(modalMode.value === 'create' ? 'create' : `save:${selectedVendorId.value}`)
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
      stopPending()
    }
  }

  async function handleDelete(vendor: VendorSettingsRow) {
    startPending(`delete:${vendor.id}`)
    clearError()

    try {
      await deleteVendor(vendor.id)
    } finally {
      stopPending()
    }
  }

  return {
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
  }
}
