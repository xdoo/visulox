import type { CriteriaCsvQuestionRow } from '../types/criteria-csv'

interface UseCriteriaSectionActionsOptions {
  sectionId: string
}

export function useCriteriaSectionActions(options: UseCriteriaSectionActionsOptions) {
  const csvError = ref('')
  const isDeleteModalOpen = ref(false)
  const route = useRoute()
  const { isSaving, errorMessage, saveAbschnittFragen } = useSaveAbschnittFragen()
  const {
    isDeleting,
    errorMessage: deleteErrorMessage,
    deleteAbschnittFragen
  } = useDeleteAbschnittFragen()

  async function refreshSectionData() {
    await refreshNuxtData(`ausschreibung-detail:${route.params.id}`)
  }

  async function handleCsvUploaded(parsedQuestions: CriteriaCsvQuestionRow[]) {
    csvError.value = ''

    try {
      await saveAbschnittFragen(options.sectionId, parsedQuestions)
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
      await deleteAbschnittFragen(options.sectionId)
      await refreshSectionData()
      isDeleteModalOpen.value = false
    } catch {
      csvError.value = deleteErrorMessage.value || 'Fragen konnten nicht gelöscht werden.'
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
