import { computed, toValue } from 'vue'

import type { MaybeRefOrGetter } from 'vue'

export interface VendorCostSummaryItem {
  label: string
  value: number
}

export function useVendorCostSummaries(
  projectTotal: MaybeRefOrGetter<number>,
  runTotal: MaybeRefOrGetter<number>,
  runTotalOverConsiderationYears: MaybeRefOrGetter<number>,
  considerationYears: MaybeRefOrGetter<number>
) {
  const projectSummaries = computed<VendorCostSummaryItem[]>(() => [
    {
      label: 'Gesamtsumme',
      value: toValue(projectTotal)
    }
  ])

  const runSummaries = computed<VendorCostSummaryItem[]>(() => [
    {
      label: 'Jährliche Summe',
      value: toValue(runTotal)
    },
    {
      label: `Gesamtsumme über ${toValue(considerationYears)} Jahre`,
      value: toValue(runTotalOverConsiderationYears)
    }
  ])

  return {
    projectSummaries,
    runSummaries
  }
}
