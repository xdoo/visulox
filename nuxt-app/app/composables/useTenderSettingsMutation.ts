import { ref } from 'vue'

export function useTenderSettingsMutation(tenderId: string) {
  const route = useRoute()
  const errorMessage = ref('')

  async function refreshTenderDetail() {
    const normalizedTenderId = String(tenderId || '').trim()
    const catalogId = typeof route.params.catalogId === 'string'
      ? route.params.catalogId.trim()
      : ''
    const keys = new Set([
      `tender-detail:${normalizedTenderId}`,
      `tender-detail:${normalizedTenderId}:${catalogId || 'default'}`
    ])

    await Promise.all([...keys].map(key => refreshNuxtData(key)))
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
