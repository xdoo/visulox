import type { CriteriaCsvQuestionRow } from '../types/criteria-csv'
import type { SaveAbschnittFragenResponse } from '../../shared/types/ausschreibungen'

type SaveAbschnittFragenFetcher = <T>(request: string, options: {
  method: 'POST'
  body: {
    questions: CriteriaCsvQuestionRow[]
  }
}) => Promise<T>

export function useSaveAbschnittFragen(fetcher: SaveAbschnittFragenFetcher = $fetch as SaveAbschnittFragenFetcher) {
  const isSaving = ref(false)
  const errorMessage = ref('')

  async function saveAbschnittFragen(abschnittId: string, questions: CriteriaCsvQuestionRow[]) {
    isSaving.value = true
    errorMessage.value = ''

    try {
      return await fetcher<SaveAbschnittFragenResponse>(`/api/abschnitte/${abschnittId}/fragen`, {
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

  return {
    isSaving,
    errorMessage,
    saveAbschnittFragen
  }
}
