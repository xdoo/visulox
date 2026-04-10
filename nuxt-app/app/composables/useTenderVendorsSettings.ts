import { computed, reactive, ref, toValue } from 'vue'

import { useTenderSettings } from './useTenderSettings'

import type { MaybeRefOrGetter } from 'vue'
import type { TenderSection, TenderVendor } from '../../shared/types/tenders'

export interface VendorSettingsRow extends TenderVendor {
  hasImportedQuestions: boolean
}

type VendorModalMode = 'create' | 'edit'

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
  const isModalOpen = ref(false)
  const modalMode = ref<VendorModalMode>('create')
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
  } = useTenderSettings(tenderId)

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

  function openCreateModal() {
    modalMode.value = 'create'
    selectedVendorId.value = ''
    form.name = ''
    clearError()
    isModalOpen.value = true
  }

  function openEditModal(vendor: VendorSettingsRow) {
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

  async function handleDelete(vendor: VendorSettingsRow) {
    pendingAction.value = `delete:${vendor.id}`
    clearError()

    try {
      await deleteVendor(vendor.id)
    } finally {
      pendingAction.value = ''
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
