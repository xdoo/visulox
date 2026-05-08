import { computed, toValue } from 'vue'

import type { MaybeRefOrGetter } from 'vue'
import type { TenderCriteriaCatalogType, TenderDetail } from '../../shared/types/tenders'

export function useTenderDetail(
  tenderId: MaybeRefOrGetter<string>,
  catalogId?: MaybeRefOrGetter<string>,
  catalogType?: MaybeRefOrGetter<TenderCriteriaCatalogType | ''>
) {
  const normalizedTenderId = computed(() => {
    return String(toValue(tenderId) || '').trim()
  })
  const normalizedCatalogId = computed(() => {
    return String(toValue(catalogId) || '').trim()
  })
  const normalizedCatalogType = computed(() => {
    return String(toValue(catalogType) || '').trim()
  })
  const query = computed(() => {
    if (normalizedCatalogId.value) {
      return { catalogId: normalizedCatalogId.value }
    }

    if (normalizedCatalogType.value) {
      return { catalogType: normalizedCatalogType.value }
    }

    return undefined
  })

  return useFetch<TenderDetail>(() => `/api/tenders/${normalizedTenderId.value}`, {
    key: () => `tender-detail:${normalizedTenderId.value}:${normalizedCatalogId.value || normalizedCatalogType.value || 'default'}`,
    query
  })
}
