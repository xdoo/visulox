export interface TenderSectionInput {
  name: string
  weight: number
}

export interface TenderPriceCategoryInput {
  name: string
}

export interface TenderVendorInput {
  name: string
}

export interface SectionQuestionInput {
  nr: string
  frage: string
  punkte: number
  anteil: number
}

export interface CreateTenderRequest {
  name: string
  sections: TenderSectionInput[]
  priceCategories: TenderPriceCategoryInput[]
  vendors: TenderVendorInput[]
}

export interface CreateTenderResponse {
  id: string
}

export interface TenderListItem {
  id: string
  name: string
}

export interface TenderVendor {
  id: string
  name: string
}

export interface TenderSection {
  id: string
  name: string
  weight: number
  questions: SectionQuestion[]
}

export interface TenderDetail {
  id: string
  name: string
  vendors: TenderVendor[]
  sections: TenderSection[]
}

export interface SectionQuestion {
  id: string
  nr: string
  frage: string
  punkte: number
  anteil: number
  gewichtetePunkte: number
}

export interface SaveSectionQuestionsRequest {
  questions: SectionQuestionInput[]
}

export interface SaveSectionQuestionsResponse {
  questions: SectionQuestion[]
}
