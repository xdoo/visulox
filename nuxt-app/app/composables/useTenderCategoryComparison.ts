import { calculateSectionFulfillmentPercentage } from './useCriteriaSectionFulfillment'

import type {
  TenderSection,
  TenderSettings,
  TenderVendor
} from '../../shared/types/tenders'

export interface SectionVendorComparisonItem {
  vendorId: string
  vendorName: string
  fulfillment: number
  isBest: boolean
  hasQuestions: boolean
}

export interface SectionVendorComparisonRow {
  sectionId: string
  sectionName: string
  sectionWeight: number
  vendors: SectionVendorComparisonItem[]
}

function roundValue(value: number, digits = 2) {
  return Number(value.toFixed(digits))
}

export function buildSectionVendorComparisonRows(
  vendors: TenderVendor[],
  sections: TenderSection[],
  scoreRange: TenderSettings['scoreRange']
) {
  return sections.map<SectionVendorComparisonRow>((section) => {
    const vendorRows = vendors.map<SectionVendorComparisonItem>((vendor) => {
      const questions = section.questionsByVendor.find((entry) => entry.vendorId === vendor.id)?.questions || []
      const fulfillment = calculateSectionFulfillmentPercentage(questions, section.weight, scoreRange) || 0

      return {
        vendorId: vendor.id,
        vendorName: vendor.name,
        fulfillment: roundValue(fulfillment),
        isBest: false,
        hasQuestions: questions.length > 0
      }
    })

    const highestFulfillment = Math.max(
      0,
      ...vendorRows.map((vendorRow) => vendorRow.fulfillment)
    )

    return {
      sectionId: section.id,
      sectionName: section.name,
      sectionWeight: section.weight,
      vendors: vendorRows.map((vendorRow) => ({
        ...vendorRow,
        isBest: vendorRow.fulfillment === highestFulfillment && highestFulfillment > 0
      }))
    }
  })
}
