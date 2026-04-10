import { ref } from 'vue'

export function useTenderSettingsMutation(tenderId: string) {
  const errorMessage = ref('')

  async function refreshTenderDetail() {
    await refreshNuxtData(`tender-detail:${tenderId}`)
  }

  async function runMutation<T>(action: () => Promise<T>) {
    errorMessage.value = ''

    try {
      const result = await action()
      await refreshTenderDetail()
      return result
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Änderung konnte nicht gespeichert werden.'
      throw error
    }
  }

  function clearError() {
    errorMessage.value = ''
  }

  return {
    errorMessage,
    runMutation,
    clearError
  }
}
