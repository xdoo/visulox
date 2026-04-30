import { tenderCostBlockTypeLabels } from '../../shared/constants/cost-blocks'
import { parseVendorCostAmount } from './useTenderVendorCosts'

import type { TenderVendor } from '../../shared/types/tenders'
import type { VendorCostRow } from './useTenderVendorCosts'

interface VendorCostBlocksExportRow {
  kostenblock: string
  kostenart: string
  kosten: number | null
  beschreibung: string
}

export interface VendorCostBlocksExportPayload {
  anbieter: {
    id: string
    name: string
  }
  kosten: {
    projekt: VendorCostBlocksExportRow[]
    run: VendorCostBlocksExportRow[]
  }
}

function toExportRow(row: VendorCostRow): VendorCostBlocksExportRow {
  const parsedAmount = parseVendorCostAmount(row.amount)

  return {
    kostenblock: row.name,
    kostenart: tenderCostBlockTypeLabels[row.type],
    kosten: parsedAmount === null || Number.isNaN(parsedAmount) ? null : parsedAmount,
    beschreibung: row.kommentar.trim()
  }
}

export function getVendorCostBlocksJsonFilename(vendor: Pick<TenderVendor, 'id' | 'name'>) {
  const slug = vendor.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `anbieter-${slug || vendor.id}-kostenbloecke.json`
}

export function buildVendorCostBlocksJsonPayload(
  vendor: TenderVendor,
  projectRows: VendorCostRow[],
  runRows: VendorCostRow[]
): VendorCostBlocksExportPayload {
  return {
    anbieter: {
      id: vendor.id,
      name: vendor.name
    },
    kosten: {
      projekt: projectRows.map(toExportRow),
      run: runRows.map(toExportRow)
    }
  }
}

export function downloadVendorCostBlocksJson(
  vendor: TenderVendor,
  projectRows: VendorCostRow[],
  runRows: VendorCostRow[]
) {
  const payload = buildVendorCostBlocksJsonPayload(vendor, projectRows, runRows)
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: 'application/json;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = getVendorCostBlocksJsonFilename(vendor)
  link.click()
  URL.revokeObjectURL(url)
}
