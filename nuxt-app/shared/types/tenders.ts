export interface TenderSectionInput {
  name: string
  weight: number
  evaluators?: string
  description?: string
}

export interface TenderPriceCategoryInput {
  name: string
}

export type TenderCostBlockType =
  | 'license_one_time'
  | 'project'
  | 'vendor_operating'
  | 'infrastructure'

export interface TenderVendorInput {
  name: string
}

export interface SectionQuestionInput {
  nr: string
  frage: string
  punkte: number
  kommentar: string
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
  criteriaCatalogs?: TenderCriteriaCatalog[]
}

export interface TenderCriteriaCatalog {
  id: string
  name: string
}

export interface TenderVendor {
  id: string
  name: string
  projectCostAssessment?: string
  runCostAssessment?: string
}

export interface TenderChartPaletteEntry {
  fillColor: string
  textColor: string
}

export interface TenderSettings {
  scoreRange: [number, number]
  considerationYears: number
  chartPalette: TenderChartPaletteEntry[]
}

export interface TenderCostBlock {
  id: string
  name: string
  type: TenderCostBlockType
}

export interface TenderVendorCostItem {
  id: string
  vendorId: string
  costBlockId: string
  amount: number | null
  kommentar: string
}

export interface TenderSectionQuestionsByVendor {
  vendorId: string
  questions: SectionQuestion[]
}

export interface TenderSection {
  id: string
  name: string
  weight: number
  evaluators: string
  description: string
  resultAssessment: string
  questionsByVendor: TenderSectionQuestionsByVendor[]
}

export interface UpdateSectionResultAssessmentRequest {
  resultAssessment: string
}

export interface UpdateSectionResultAssessmentResponse {
  section: Pick<TenderSection, 'id' | 'resultAssessment'>
}

export interface TenderDetail {
  id: string
  name: string
  criteriaCatalogs: TenderCriteriaCatalog[]
  activeCriteriaCatalogId: string
  settings: TenderSettings
  vendors: TenderVendor[]
  sections: TenderSection[]
  costBlocks: TenderCostBlock[]
  vendorCostItems: TenderVendorCostItem[]
}

export interface SectionQuestion {
  id: string
  nr: string
  frage: string
  punkte: number
  kommentar: string
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
  considerationYears: number
  chartPalette: TenderChartPaletteEntry[]
}

export interface UpdateTenderSettingsResponse {
  settings: TenderSettings
}

export interface UpdateTenderRequest {
  name: string
}

export interface UpdateTenderResponse {
  tender: TenderListItem
}

export interface CloneTenderRequest {
  name: string
}

export interface CloneTenderResponse {
  tender: TenderListItem
}

export interface CloneCriteriaCatalogRequest {
  name: string
  sourceCatalogId?: string
}

export interface CloneCriteriaCatalogResponse {
  catalog: TenderCriteriaCatalog
}

export interface UpdateCriteriaCatalogRequest {
  name: string
}

export interface UpdateCriteriaCatalogResponse {
  catalog: TenderCriteriaCatalog
}

export interface DeleteTenderResponse {
  tender: TenderListItem
}

export interface CreateTenderCostBlockRequest {
  name: string
  type: TenderCostBlockType
}

export interface UpdateTenderCostBlockRequest {
  name: string
  type: TenderCostBlockType
}

export interface SaveVendorCostItemInput {
  costBlockId: string
  amount: number | null
  kommentar: string
}

export interface SaveVendorCostItemsRequest {
  items: SaveVendorCostItemInput[]
}

export interface SaveVendorCostItemsResponse {
  items: TenderVendorCostItem[]
}

export interface UpdateVendorCostItemCommentRequest {
  kommentar: string
}

export interface UpdateVendorCostItemCommentResponse {
  item: TenderVendorCostItem
}

export interface UpdateVendorCostAssessmentRequest {
  kind: 'project' | 'run'
  assessment: string
}

export interface UpdateVendorCostAssessmentResponse {
  vendor: Pick<TenderVendor, 'id' | 'projectCostAssessment' | 'runCostAssessment'>
}
