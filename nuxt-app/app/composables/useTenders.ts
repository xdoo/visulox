import { computed } from 'vue'

import type { TenderListItem } from '../../shared/types/tenders'

type FetchTenders = <T>(request: string) => Promise<T>

export function useTenders(fetcher: FetchTenders = $fetch as FetchTenders) {
  const items = useState<TenderListItem[]>('tenders-items', () => [])
  const isLoading = useState('tenders-loading', () => false)

  const latestTenderName = computed(() => {
    return items.value[0]?.name || 'Ausschreibungen'
  })

  function getTenderPath(id: string) {
    return `/tenders/${id}`
  }

  function findTenderById(id: string) {
    return items.value.find(item => item.id === id) || null
  }

  async function loadTenders() {
    if (isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      items.value = await fetcher<TenderListItem[]>('/api/tenders')
    } finally {
      isLoading.value = false
    }
  }

  function addTender(item: TenderListItem) {
    items.value = [item, ...items.value.filter(existingItem => existingItem.id !== item.id)]
  }

  return {
    items,
    latestTenderName,
    loadTenders,
    addTender,
    getTenderPath,
    findTenderById
  }
}
