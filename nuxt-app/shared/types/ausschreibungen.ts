export interface AusschreibungSectionInput {
  name: string
  weight: number
}

export interface AusschreibungPriceCategoryInput {
  name: string
}

export interface AusschreibungVendorInput {
  name: string
}

export interface CreateAusschreibungRequest {
  name: string
  sections: AusschreibungSectionInput[]
  priceCategories: AusschreibungPriceCategoryInput[]
  vendors: AusschreibungVendorInput[]
}

export interface CreateAusschreibungResponse {
  id: string
}

export interface AusschreibungListItem {
  id: string
  name: string
}
