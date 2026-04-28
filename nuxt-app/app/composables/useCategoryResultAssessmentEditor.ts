import { computed, ref } from 'vue'

import { useTenderSettingsMutation } from './useTenderSettingsMutation'

import type {
  TenderSection,
  UpdateSectionResultAssessmentRequest,
  UpdateSectionResultAssessmentResponse
} from '../../shared/types/tenders'

type PatchResultAssessmentFetcher = <T>(request: string, options: {
  method: 'PATCH'
  body: UpdateSectionResultAssessmentRequest
}) => Promise<T>

export function useCategoryResultAssessmentEditor(tenderId: string) {
  const patchResultAssessmentFetcher = $fetch as PatchResultAssessmentFetcher
  const {
    errorMessage,
    runMutation,
    clearError
  } = useTenderSettingsMutation(tenderId)

  const isResultAssessmentModalOpen = ref(false)
  const selectedSection = ref<TenderSection | null>(null)
  const resultAssessment = ref('')
  const isSavingResultAssessment = ref(false)

  const canSaveResultAssessment = computed(() => {
    return Boolean(selectedSection.value)
      && !isSavingResultAssessment.value
      && resultAssessment.value.trim() !== (selectedSection.value?.resultAssessment || '').trim()
  })

  function openResultAssessmentEditor(section: TenderSection) {
    selectedSection.value = section
    resultAssessment.value = section.resultAssessment || ''
    clearError()
    isResultAssessmentModalOpen.value = true
  }

  async function saveResultAssessment() {
    const section = selectedSection.value

    if (!section || !canSaveResultAssessment.value) {
      return
    }

    isSavingResultAssessment.value = true
    clearError()

    try {
      await runMutation(() => patchResultAssessmentFetcher<UpdateSectionResultAssessmentResponse>(
        `/api/sections/${section.id}/result-assessment`,
        {
          method: 'PATCH',
          body: {
            resultAssessment: resultAssessment.value.trim()
          }
        }
      ))

      isResultAssessmentModalOpen.value = false
    } finally {
      isSavingResultAssessment.value = false
    }
  }

  return {
    errorMessage,
    isResultAssessmentModalOpen,
    selectedSection,
    resultAssessment,
    isSavingResultAssessment,
    canSaveResultAssessment,
    openResultAssessmentEditor,
    saveResultAssessment
  }
}
