import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useVendorCostSummaries } from '../app/composables/useVendorCostSummaries'

describe('useVendorCostSummaries', () => {
  it('builds project and run summary rows', () => {
    const projectTotal = ref(1000)
    const runTotal = ref(250)
    const runTotalOverConsiderationYears = ref(2500)
    const considerationYears = ref(10)

    const { projectSummaries, runSummaries } = useVendorCostSummaries(
      computed(() => projectTotal.value),
      computed(() => runTotal.value),
      computed(() => runTotalOverConsiderationYears.value),
      computed(() => considerationYears.value)
    )

    expect(projectSummaries.value).toEqual([
      { label: 'Gesamtsumme', value: 1000 }
    ])

    expect(runSummaries.value).toEqual([
      { label: 'Jährliche Summe', value: 250 },
      { label: 'Gesamtsumme über 10 Jahre', value: 2500 }
    ])
  })
})
