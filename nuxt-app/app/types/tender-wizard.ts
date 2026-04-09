export interface TenderCriterion {
  name: string
  weight: number
}

export interface TenderPriceBlock {
  name: string
}

export interface TenderVendor {
  name: string
}

export interface TenderFormData {
  name: string
  criteria: TenderCriterion[]
  priceBlocks: TenderPriceBlock[]
  vendors: TenderVendor[]
}
