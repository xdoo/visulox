import { computed, ref } from 'vue'

import { useTenderSettingsMutation } from './useTenderSettingsMutation'

import type {
  TenderVendor,
  UpdateVendorCostAssessmentRequest,
  UpdateVendorCostAssessmentResponse
} from '../../shared/types/tenders'

export type VendorCostAssessmentKind = 'project' | 'run'

type PatchVendorCostAssessmentFetcher = <T>(request: string, options: {
  method: 'PATCH'
  body: UpdateVendorCostAssessmentRequest
}) => Promise<T>

export function useVendorCostAssessmentsEditor(tenderId: string) {
  const patchVendorCostAssessmentFetcher = $fetch as PatchVendorCostAssessmentFetcher
  const { errorMessage, runMutation, clearError } = useTenderSettingsMutation(tenderId)

  const isCostAssessmentModalOpen = ref(false)
  const selectedVendor = ref<TenderVendor | null>(null)
  const selectedKind = ref<VendorCostAssessmentKind>('project')
  const assessment = ref('')
  const isSavingCostAssessment = ref(false)

  const modalTitle = computed(() => {
    if (!selectedVendor.value) {
      return 'Kostenbewertung'
    }

    return selectedKind.value === 'project'
      ? `Projektkosten-Bewertung: ${selectedVendor.value.name}`
      : `Run-Kosten-Bewertung: ${selectedVendor.value.name}`
  })

  const canSaveCostAssessment = computed(() => {
    if (!selectedVendor.value || isSavingCostAssessment.value) {
      return false
    }

    const baseline = selectedKind.value === 'project'
      ? (selectedVendor.value.projectCostAssessment || '')
      : (selectedVendor.value.runCostAssessment || '')

    return assessment.value.trim() !== baseline.trim()
  })

  function openCostAssessmentEditor(vendor: TenderVendor, kind: VendorCostAssessmentKind) {
    selectedVendor.value = vendor
    selectedKind.value = kind
    assessment.value = kind === 'project'
      ? (vendor.projectCostAssessment || '')
      : (vendor.runCostAssessment || '')
    clearError()
    isCostAssessmentModalOpen.value = true
  }

  async function saveCostAssessment() {
    const vendor = selectedVendor.value

    if (!vendor || !canSaveCostAssessment.value) {
      return
    }

    isSavingCostAssessment.value = true
    clearError()

    try {
      await runMutation(() => patchVendorCostAssessmentFetcher<UpdateVendorCostAssessmentResponse>(
        `/api/vendors/${vendor.id}/cost-assessments`,
        {
          method: 'PATCH',
          body: {
            kind: selectedKind.value,
            assessment: assessment.value.trim()
          }
        }
      ))

      isCostAssessmentModalOpen.value = false
    } finally {
      isSavingCostAssessment.value = false
    }
  }

  return {
    errorMessage,
    isCostAssessmentModalOpen,
    selectedKind,
    selectedVendor,
    assessment,
    modalTitle,
    isSavingCostAssessment,
    canSaveCostAssessment,
    openCostAssessmentEditor,
    saveCostAssessment
  }
}
