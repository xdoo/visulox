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

export interface AbschnittFrageInput {
  nr: string
  frage: string
  punkte: number
  anteil: number
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

export interface AusschreibungVendor {
  id: string
  name: string
}

export interface AusschreibungSection {
  id: string
  name: string
  weight: number
  questions: AbschnittFrage[]
}

export interface AusschreibungDetail {
  id: string
  name: string
  vendors: AusschreibungVendor[]
  sections: AusschreibungSection[]
}

export interface AbschnittFrage {
  id: string
  nr: string
  frage: string
  punkte: number
  anteil: number
  gewichtetePunkte: number
}

export interface SaveAbschnittFragenRequest {
  questions: AbschnittFrageInput[]
}

export interface SaveAbschnittFragenResponse {
  questions: AbschnittFrage[]
}
