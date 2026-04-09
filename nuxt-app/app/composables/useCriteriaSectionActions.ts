import type { CriteriaCsvQuestionRow } from '../types/criteria-csv'
import type { SaveSectionQuestionsResponse } from '../../shared/types/tenders'

interface UseCriteriaSectionActionsOptions {
  sectionId: string
}

type SaveSectionQuestionsFetcher = <T>(request: string, options: {
  method: 'POST'
  body: {
    questions: CriteriaCsvQuestionRow[]
  }
}) => Promise<T>

type DeleteSectionQuestionsFetcher = <T>(request: string, options: {
  method: 'DELETE'
}) => Promise<T>

export function useCriteriaSectionActions(options: UseCriteriaSectionActionsOptions) {
  const csvError = ref('')
  const isDeleteModalOpen = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const errorMessage = ref('')
  const route = useRoute()
  const saveFetcher = $fetch as SaveSectionQuestionsFetcher
  const deleteFetcher = $fetch as DeleteSectionQuestionsFetcher

  async function refreshSectionData() {
    await refreshNuxtData(`tender-detail:${route.params.id}`)
  }

  async function saveSectionQuestions(sectionId: string, questions: CriteriaCsvQuestionRow[]) {
    isSaving.value = true
    errorMessage.value = ''

    try {
      return await saveFetcher<SaveSectionQuestionsResponse>(`/api/sections/${sectionId}/questions`, {
        method: 'POST',
        body: { questions }
      })
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Fragen konnten nicht gespeichert werden.'
      throw error
    } finally {
      isSaving.value = false
    }
  }

  async function deleteSectionQuestions(sectionId: string) {
    isDeleting.value = true
    errorMessage.value = ''

    try {
      return await deleteFetcher<{ deleted: true }>(`/api/sections/${sectionId}/questions`, {
        method: 'DELETE'
      })
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Fragen konnten nicht gelöscht werden.'
      throw error
    } finally {
      isDeleting.value = false
    }
  }

  async function handleCsvUploaded(parsedQuestions: CriteriaCsvQuestionRow[]) {
    csvError.value = ''

    try {
      await saveSectionQuestions(options.sectionId, parsedQuestions)
      await refreshSectionData()
    } catch {
      csvError.value = errorMessage.value || 'Fragen konnten nicht gespeichert werden.'
    }
  }

  function handleCsvError(message: string) {
    csvError.value = message
  }

  async function handleDeleteQuestions() {
    csvError.value = ''

    try {
      await deleteSectionQuestions(options.sectionId)
      await refreshSectionData()
      isDeleteModalOpen.value = false
    } catch {
      csvError.value = errorMessage.value || 'Fragen konnten nicht gelöscht werden.'
    }
  }

  return {
    csvError,
    isDeleteModalOpen,
    isSaving,
    isDeleting,
    handleCsvUploaded,
    handleCsvError,
    handleDeleteQuestions
  }
}
