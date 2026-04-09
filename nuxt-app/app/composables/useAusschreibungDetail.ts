import { computed, toValue } from 'vue'

import type { MaybeRefOrGetter } from 'vue'
import type { AusschreibungDetail } from '../../shared/types/ausschreibungen'

export function useAusschreibungDetail(ausschreibungId: MaybeRefOrGetter<string>) {
  const normalizedAusschreibungId = computed(() => {
    return String(toValue(ausschreibungId) || '').trim()
  })

  return useFetch<AusschreibungDetail>(() => `/api/ausschreibungen/${normalizedAusschreibungId.value}`, {
    key: () => `ausschreibung-detail:${normalizedAusschreibungId.value}`
  })
}
