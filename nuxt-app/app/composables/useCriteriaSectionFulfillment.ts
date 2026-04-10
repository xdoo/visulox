import { computed } from 'vue'
import type { Ref } from 'vue'
import type { SectionQuestion } from '../../shared/types/tenders'

export function calculateSectionFulfillmentPercentage(questions: SectionQuestion[], sectionWeight: number, maxPoints: number) {
  if (questions.length === 0 || !Number.isFinite(sectionWeight) || sectionWeight <= 0 || !Number.isFinite(maxPoints) || maxPoints <= 0) {
    return null
  }

  const totalWeightedPoints = questions.reduce((sum, question) => sum + question.gewichtetePunkte, 0)
  const maxPossibleWeightedPoints = (maxPoints * sectionWeight) / 100
  const fulfillment = (totalWeightedPoints / maxPossibleWeightedPoints) * 100

  return Math.min(Math.max(fulfillment, 0), 100)
}

export function formatSectionFulfillmentPercentage(percentage: number | null) {
  if (percentage === null) {
    return ''
  }

  return `${Math.round(percentage)}%`
}

export function getSectionFulfillmentBadgeColor(percentage: number | null) {
  if (percentage === null) {
    return 'neutral'
  }

  if (percentage <= 100 / 3) {
    return 'error'
  }

  if (percentage <= (200 / 3)) {
    return 'warning'
  }

  return 'success'
}

export function useCriteriaSectionFulfillment(
  questions: Ref<SectionQuestion[]>,
  sectionWeight: Ref<number>,
  maxPoints: Ref<number>
) {
  const fulfillmentPercentage = computed(() =>
    calculateSectionFulfillmentPercentage(questions.value, sectionWeight.value, maxPoints.value)
  )
  const fulfillmentLabel = computed(() => formatSectionFulfillmentPercentage(fulfillmentPercentage.value))
  const fulfillmentBadgeColor = computed(() => getSectionFulfillmentBadgeColor(fulfillmentPercentage.value))

  return {
    fulfillmentPercentage,
    fulfillmentLabel,
    fulfillmentBadgeColor
  }
}
