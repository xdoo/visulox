import { computed, ref, toValue, watch } from 'vue'

import { useTenderSettingsMutation } from './useTenderSettingsMutation'

import type {
  SaveVendorCostItemsRequest,
  TenderCostBlock,
  TenderCostBlockType,
  TenderVendor,
  TenderVendorCostItem
} from '../../shared/types/tenders'
import type { MaybeRefOrGetter } from 'vue'

export type VendorCostGroupKey = 'project' | 'run'

export interface VendorCostRow {
  costBlockId: string
  name: string
  type: TenderCostBlockType
  amount: string
}

type PutFetcher = <T>(request: string, options: { method: 'PUT', body: SaveVendorCostItemsRequest }) => Promise<T>

export function getVendorCostGroup(type: TenderCostBlockType): VendorCostGroupKey {
  return type === 'vendor_operating' || type === 'infrastructure' ? 'run' : 'project'
}

export function formatVendorCostAmount(amount: number | null) {
  return amount === null ? '' : String(amount)
}

export function formatVendorCostInputValue(value: string) {
  const parsedAmount = parseVendorCostAmount(value)

  if (value.trim() === '') {
    return ''
  }

  if (parsedAmount === null || Number.isNaN(parsedAmount)) {
    return value
  }

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(parsedAmount)
}

export function parseVendorCostAmount(value: string) {
  const sanitizedValue = value
    .trim()
    .replace(/\s/g, '')
    .replace(/€/g, '')

  if (!sanitizedValue) {
    return null
  }

  let normalizedValue = sanitizedValue

  if (sanitizedValue.includes(',')) {
    normalizedValue = sanitizedValue.replace(/\./g, '').replace(',', '.')
  } else if (sanitizedValue.split('.').length > 2) {
    normalizedValue = sanitizedValue.replace(/\./g, '')
  }

  const amount = Number(normalizedValue)

  return Number.isFinite(amount) && amount >= 0 ? amount : Number.NaN
}

export function mapVendorCostRows(
  costBlocks: TenderCostBlock[],
  vendorCostItems: TenderVendorCostItem[],
  vendorId: string
) {
  const vendorItemsByCostBlockId = new Map(
    vendorCostItems
      .filter((item) => item.vendorId === vendorId)
      .map((item) => [item.costBlockId, item])
  )

  return costBlocks.map<VendorCostRow>((costBlock) => ({
    costBlockId: costBlock.id,
    name: costBlock.name,
    type: costBlock.type,
    amount: formatVendorCostAmount(vendorItemsByCostBlockId.get(costBlock.id)?.amount ?? null)
  }))
}

export function useTenderVendorCosts(
  tenderId: string,
  vendor: MaybeRefOrGetter<TenderVendor | null>,
  costBlocks: MaybeRefOrGetter<TenderCostBlock[]>,
  vendorCostItems: MaybeRefOrGetter<TenderVendorCostItem[]>
) {
  const putFetcher = globalThis.$fetch as PutFetcher
  const { errorMessage, runMutation, clearError } = useTenderSettingsMutation(tenderId)
  const rows = ref<VendorCostRow[]>([])
  const isSaving = ref(false)

  watch([() => toValue(vendor), () => toValue(costBlocks), () => toValue(vendorCostItems)], ([nextVendor, nextCostBlocks, nextVendorCostItems]) => {
    rows.value = nextVendor
      ? mapVendorCostRows(nextCostBlocks, nextVendorCostItems, nextVendor.id)
      : []
  }, { immediate: true, deep: true })

  const projectRows = computed(() => rows.value.filter((row) => getVendorCostGroup(row.type) === 'project'))
  const runRows = computed(() => rows.value.filter((row) => getVendorCostGroup(row.type) === 'run'))

  const hasInvalidAmounts = computed(() => {
    return rows.value.some((row) => Number.isNaN(parseVendorCostAmount(row.amount)))
  })

  const hasChanges = computed(() => {
    const currentVendor = toValue(vendor)

    if (!currentVendor) {
      return false
    }

    const baselineRows = mapVendorCostRows(toValue(costBlocks), toValue(vendorCostItems), currentVendor.id)

    if (baselineRows.length !== rows.value.length) {
      return true
    }

    return baselineRows.some((baselineRow, index) => baselineRow.amount !== rows.value[index]?.amount)
  })

  const canSave = computed(() => {
    return Boolean(toValue(vendor)) && !hasInvalidAmounts.value && hasChanges.value
  })

  function updateAmount(costBlockId: string, value: string) {
    const row = rows.value.find((entry) => entry.costBlockId === costBlockId)

    if (!row) {
      return
    }

    row.amount = value
  }

  async function save() {
    const currentVendor = toValue(vendor)

    if (!currentVendor || !canSave.value) {
      return
    }

    isSaving.value = true
    clearError()

    try {
      const items = rows.value.map((row) => ({
        costBlockId: row.costBlockId,
        amount: parseVendorCostAmount(row.amount)
      }))

      await runMutation(() => putFetcher(`/api/vendors/${currentVendor.id}/cost-items`, {
        method: 'PUT',
        body: { items }
      }))
    } finally {
      isSaving.value = false
    }
  }

  return {
    errorMessage,
    isSaving,
    projectRows,
    runRows,
    canSave,
    hasInvalidAmounts,
    updateAmount,
    save
  }
}
