import { computed } from 'vue'

import type { AusschreibungListItem } from '../../shared/types/ausschreibungen'

type FetchAusschreibungen = <T>(request: string) => Promise<T>

export function useAusschreibungen(fetcher: FetchAusschreibungen = $fetch as FetchAusschreibungen) {
  const items = useState<AusschreibungListItem[]>('ausschreibungen-items', () => [])
  const isLoading = useState('ausschreibungen-loading', () => false)

  const latestAusschreibungName = computed(() => {
    return items.value[0]?.name || 'Ausschreibungen'
  })

  function getAusschreibungPath(id: string) {
    return `/ausschreibungen/${id}`
  }

  function findAusschreibungById(id: string) {
    return items.value.find(item => item.id === id) || null
  }

  async function loadAusschreibungen() {
    if (isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      items.value = await fetcher<AusschreibungListItem[]>('/api/ausschreibungen')
    } finally {
      isLoading.value = false
    }
  }

  function addAusschreibung(item: AusschreibungListItem) {
    items.value = [item, ...items.value.filter(existingItem => existingItem.id !== item.id)]
  }

  return {
    items,
    latestAusschreibungName,
    loadAusschreibungen,
    addAusschreibung,
    getAusschreibungPath,
    findAusschreibungById
  }
}
