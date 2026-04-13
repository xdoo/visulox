import { getVendorCostGroup } from './useTenderVendorCosts'

import type {
  TenderCostBlock,
  TenderCostBlockType,
  TenderSettings,
  TenderVendor,
  TenderVendorCostItem
} from '../../shared/types/tenders'

export type VendorCostOverviewRowKind = 'project' | 'run'

export interface VendorCostOverviewSegment {
  costBlockId: string
  name: string
  type: TenderCostBlockType
  value: number
  annualValue: number
}

export interface VendorCostOverviewRow {
  id: string
  vendorId: string
  vendorName: string
  kind: VendorCostOverviewRowKind
  label: string
  total: number
  annualTotal: number
  considerationYears: number
  segments: VendorCostOverviewSegment[]
}

function roundCostValue(value: number) {
  return Number(value.toFixed(2))
}

export function formatCostChartValue(value: number) {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(roundCostValue(value))
}

export function formatCostChartMillionValue(value: number) {
  return `${new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(roundCostValue(value / 1_000_000))} Mio.`
}

export function buildVendorCostOverviewRows(
  vendors: TenderVendor[],
  costBlocks: TenderCostBlock[],
  vendorCostItems: TenderVendorCostItem[],
  considerationYears: TenderSettings['considerationYears']
) {
  const costBlocksById = new Map(costBlocks.map((costBlock) => [costBlock.id, costBlock]))
  const vendorItemsByVendorId = new Map<string, TenderVendorCostItem[]>()

  vendorCostItems.forEach((item) => {
    const vendorItems = vendorItemsByVendorId.get(item.vendorId) || []
    vendorItems.push(item)
    vendorItemsByVendorId.set(item.vendorId, vendorItems)
  })

  const rows = vendors.flatMap<VendorCostOverviewRow>((vendor) => {
    const vendorItems = vendorItemsByVendorId.get(vendor.id) || []

    const projectSegments: VendorCostOverviewSegment[] = []
    const runSegments: VendorCostOverviewSegment[] = []

    vendorItems.forEach((item) => {
      const costBlock = costBlocksById.get(item.costBlockId)
      const annualValue = item.amount ?? 0

      if (!costBlock || annualValue <= 0) {
        return
      }

      const group = getVendorCostGroup(costBlock.type)
      const value = group === 'run'
        ? annualValue * considerationYears
        : annualValue

      const segment: VendorCostOverviewSegment = {
        costBlockId: costBlock.id,
        name: costBlock.name,
        type: costBlock.type,
        value: roundCostValue(value),
        annualValue: roundCostValue(annualValue)
      }

      if (group === 'run') {
        runSegments.push(segment)
      } else {
        projectSegments.push(segment)
      }
    })

    const projectTotal = roundCostValue(projectSegments.reduce((sum, segment) => sum + segment.value, 0))
    const runTotal = roundCostValue(runSegments.reduce((sum, segment) => sum + segment.value, 0))
    const runAnnualTotal = roundCostValue(runSegments.reduce((sum, segment) => sum + segment.annualValue, 0))

    return [
      {
        id: `${vendor.id}-project`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        kind: 'project',
        label: `${vendor.name} · Projekt`,
        total: projectTotal,
        annualTotal: projectTotal,
        considerationYears,
        segments: projectSegments
      },
      {
        id: `${vendor.id}-run`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        kind: 'run',
        label: `${vendor.name} · Run`,
        total: runTotal,
        annualTotal: runAnnualTotal,
        considerationYears,
        segments: runSegments
      }
    ]
  })

  return rows.sort((left, right) => {
    if (left.vendorId === right.vendorId) {
      return left.kind === 'project' ? -1 : 1
    }

    const leftVendorTotal = rows
      .filter((row) => row.vendorId === left.vendorId)
      .reduce((sum, row) => sum + row.total, 0)
    const rightVendorTotal = rows
      .filter((row) => row.vendorId === right.vendorId)
      .reduce((sum, row) => sum + row.total, 0)

    return rightVendorTotal - leftVendorTotal
  })
}
