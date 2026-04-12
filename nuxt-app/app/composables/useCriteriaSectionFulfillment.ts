import { computed } from 'vue'
import type { Ref } from 'vue'
import type { SectionQuestion, TenderSettings } from '../../shared/types/tenders'

export function calculateScoreRangeSpan(scoreRange: TenderSettings['scoreRange']) {
  const [minScore, maxScore] = scoreRange

  if (!Number.isFinite(minScore) || !Number.isFinite(maxScore) || maxScore <= minScore) {
    return null
  }

  return maxScore - minScore
}

export function calculateSectionFulfillmentPercentage(
  questions: SectionQuestion[],
  sectionWeight: number,
  scoreRange: TenderSettings['scoreRange']
) {
  const scoreRangeSpan = calculateScoreRangeSpan(scoreRange)

  if (questions.length === 0 || !Number.isFinite(sectionWeight) || sectionWeight <= 0 || scoreRangeSpan === null) {
    return null
  }

  const [minScore] = scoreRange
  const normalizedWeightedPoints = questions.reduce((sum, question) => {
    return sum + ((question.punkte - minScore) * question.anteil)
  }, 0)
  const maxPossibleWeightedPoints = (scoreRangeSpan * sectionWeight) / 100
  const fulfillment = (normalizedWeightedPoints / maxPossibleWeightedPoints) * 100

  return Math.min(Math.max(fulfillment, 0), 100)
}

export function calculateSectionContributionPercentage(
  questions: SectionQuestion[],
  sectionWeight: number,
  scoreRange: TenderSettings['scoreRange']
) {
  const fulfillment = calculateSectionFulfillmentPercentage(questions, sectionWeight, scoreRange)

  if (fulfillment === null) {
    return null
  }

  return (sectionWeight * fulfillment) / 100
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
  scoreRange: Ref<TenderSettings['scoreRange']>
) {
  const fulfillmentPercentage = computed(() =>
    calculateSectionFulfillmentPercentage(questions.value, sectionWeight.value, scoreRange.value)
  )
  const contributionPercentage = computed(() =>
    calculateSectionContributionPercentage(questions.value, sectionWeight.value, scoreRange.value)
  )
  const fulfillmentLabel = computed(() => formatSectionFulfillmentPercentage(fulfillmentPercentage.value))
  const fulfillmentBadgeColor = computed(() => getSectionFulfillmentBadgeColor(fulfillmentPercentage.value))

  return {
    fulfillmentPercentage,
    contributionPercentage,
    fulfillmentLabel,
    fulfillmentBadgeColor
  }
}
