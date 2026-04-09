type DeleteAbschnittFragenFetcher = <T>(request: string, options: {
  method: 'DELETE'
}) => Promise<T>

export function useDeleteAbschnittFragen(fetcher: DeleteAbschnittFragenFetcher = $fetch as DeleteAbschnittFragenFetcher) {
  const isDeleting = ref(false)
  const errorMessage = ref('')

  async function deleteAbschnittFragen(abschnittId: string) {
    isDeleting.value = true
    errorMessage.value = ''

    try {
      return await fetcher<{ deleted: true }>(`/api/abschnitte/${abschnittId}/fragen`, {
        method: 'DELETE'
      })
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Fragen konnten nicht gelöscht werden.'
      throw error
    } finally {
      isDeleting.value = false
    }
  }

  return {
    isDeleting,
    errorMessage,
    deleteAbschnittFragen
  }
}
