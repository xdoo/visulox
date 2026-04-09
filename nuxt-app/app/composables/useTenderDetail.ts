import { computed, toValue } from 'vue'

import type { MaybeRefOrGetter } from 'vue'
import type { TenderDetail } from '../../shared/types/tenders'

export function useTenderDetail(tenderId: MaybeRefOrGetter<string>) {
  const normalizedTenderId = computed(() => {
    return String(toValue(tenderId) || '').trim()
  })

  return useFetch<TenderDetail>(() => `/api/tenders/${normalizedTenderId.value}`, {
    key: () => `tender-detail:${normalizedTenderId.value}`
  })
}
