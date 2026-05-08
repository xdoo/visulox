import { computed, ref } from 'vue'

import type { MaybeRefOrGetter } from 'vue'
import type {
  TenderCriteriaCatalog,
  UpdateCriteriaCatalogAssessmentRequest,
  UpdateCriteriaCatalogAssessmentResponse
} from '../../shared/types/tenders'

type PatchCriteriaCatalogAssessmentFetcher = <T>(request: string, options: {
  method: 'PATCH'
  body: UpdateCriteriaCatalogAssessmentRequest
}) => Promise<T>

export function useCriteriaCatalogAssessmentEditor(tenderId: MaybeRefOrGetter<string>) {
  const route = useRoute()
  const patchFetcher = $fetch as PatchCriteriaCatalogAssessmentFetcher
  const isAssessmentModalOpen = ref(false)
  const selectedCatalog = ref<TenderCriteriaCatalog | null>(null)
  const assessmentText = ref('')
  const isSavingAssessment = ref(false)
  const errorMessage = ref('')

  const canSaveAssessment = computed(() => {
    return Boolean(selectedCatalog.value)
      && !isSavingAssessment.value
      && assessmentText.value.trim() !== (selectedCatalog.value?.assessmentText || '').trim()
  })

  function openAssessmentEditor(catalog: TenderCriteriaCatalog) {
    selectedCatalog.value = catalog
    assessmentText.value = catalog.assessmentText || ''
    errorMessage.value = ''
    isAssessmentModalOpen.value = true
  }

  async function saveAssessment() {
    const catalog = selectedCatalog.value
    const normalizedTenderId = String(toValue(tenderId) || '').trim()

    if (!catalog || !normalizedTenderId || !canSaveAssessment.value) {
      return
    }

    isSavingAssessment.value = true
    errorMessage.value = ''

    try {
      await patchFetcher<UpdateCriteriaCatalogAssessmentResponse>(
        `/api/tenders/${normalizedTenderId}/criteria-catalogs/${catalog.id}/assessment`,
        {
          method: 'PATCH',
          body: {
            assessmentText: assessmentText.value.trim()
          }
        }
      )

      await refreshNuxtData(`tender-detail:${normalizedTenderId}:${catalog.id}`)
      if (typeof route.params.catalogId !== 'string') {
        await refreshNuxtData(`tender-detail:${normalizedTenderId}:default`)
      }

      isAssessmentModalOpen.value = false
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Bewertungstext konnte nicht gespeichert werden.'
    } finally {
      isSavingAssessment.value = false
    }
  }

  return {
    errorMessage,
    isAssessmentModalOpen,
    selectedCatalog,
    assessmentText,
    isSavingAssessment,
    canSaveAssessment,
    openAssessmentEditor,
    saveAssessment
  }
}
