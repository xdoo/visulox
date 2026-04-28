import type { TenderSection, TenderVendor } from '../../shared/types/tenders'

export interface CategoryQuestionsExportQuestion {
  id: string
  nr: string
  frage: string
  gewichtungInnerhalbKategorie: number
  anteil: number
  punkte: number
  kommentar: string
}

export interface CategoryQuestionsExportVendor {
  id: string
  name: string
  fragen: CategoryQuestionsExportQuestion[]
}

export interface CategoryQuestionsExportPayload {
  kategorie: {
    id: string
    name: string
    gewicht: number
  }
  anbieter: CategoryQuestionsExportVendor[]
}

function roundValue(value: number, digits = 4) {
  return Number(value.toFixed(digits))
}

function getQuestionWeightWithinCategory(questionShare: number, sectionWeight: number) {
  if (!Number.isFinite(questionShare) || !Number.isFinite(sectionWeight) || sectionWeight <= 0) {
    return 0
  }

  return roundValue(questionShare / (sectionWeight / 100))
}

export function getCategoryQuestionsJsonFilename(section: Pick<TenderSection, 'id' | 'name'>) {
  const slug = section.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `kategorie-${slug || section.id}-fragen.json`
}

export function buildCategoryQuestionsJsonPayload(
  section: TenderSection,
  vendors: TenderVendor[]
): CategoryQuestionsExportPayload {
  return {
    kategorie: {
      id: section.id,
      name: section.name,
      gewicht: section.weight
    },
    anbieter: vendors.map((vendor) => {
      const questions = section.questionsByVendor.find((entry) => entry.vendorId === vendor.id)?.questions || []

      return {
        id: vendor.id,
        name: vendor.name,
        fragen: questions.map((question) => ({
          id: question.id,
          nr: question.nr,
          frage: question.frage,
          gewichtungInnerhalbKategorie: getQuestionWeightWithinCategory(question.anteil, section.weight),
          anteil: question.anteil,
          punkte: question.punkte,
          kommentar: question.kommentar
        }))
      }
    })
  }
}

export function downloadCategoryQuestionsJson(section: TenderSection, vendors: TenderVendor[]) {
  const payload = buildCategoryQuestionsJsonPayload(section, vendors)
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: 'application/json;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = getCategoryQuestionsJsonFilename(section)
  link.click()
  URL.revokeObjectURL(url)
}
