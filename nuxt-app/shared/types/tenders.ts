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

export interface TenderSettings {
  scoreRange: [number, number]
  chartPalette: string[]
}

export interface TenderSectionQuestionsByVendor {
  vendorId: string
  questions: SectionQuestion[]
}

export interface TenderSection {
  id: string
  name: string
  weight: number
  questionsByVendor: TenderSectionQuestionsByVendor[]
}

export interface TenderDetail {
  id: string
  name: string
  settings: TenderSettings
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
  vendorId: string
  questions: SectionQuestionInput[]
}

export interface SaveSectionQuestionsResponse {
  questions: SectionQuestion[]
}

export interface UpdateTenderSettingsRequest {
  scoreRange: [number, number]
  chartPalette: string[]
}

export interface UpdateTenderSettingsResponse {
  settings: TenderSettings
}
