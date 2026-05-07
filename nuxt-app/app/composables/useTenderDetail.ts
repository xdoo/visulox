import { computed, toValue } from 'vue'

import type { MaybeRefOrGetter } from 'vue'
import type { TenderDetail } from '../../shared/types/tenders'

export function useTenderDetail(tenderId: MaybeRefOrGetter<string>, catalogId?: MaybeRefOrGetter<string>) {
  const normalizedTenderId = computed(() => {
    return String(toValue(tenderId) || '').trim()
  })
  const normalizedCatalogId = computed(() => {
    return String(toValue(catalogId) || '').trim()
  })
  const query = computed(() => (
    normalizedCatalogId.value ? { catalogId: normalizedCatalogId.value } : undefined
  ))

  return useFetch<TenderDetail>(() => `/api/tenders/${normalizedTenderId.value}`, {
    key: () => `tender-detail:${normalizedTenderId.value}:${normalizedCatalogId.value || 'default'}`,
    query
  })
}
