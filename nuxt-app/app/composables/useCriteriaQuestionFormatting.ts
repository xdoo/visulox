export function useCriteriaQuestionFormatting() {
  function formatPercentage(value: number) {
    const percentage = value * 100

    if (Number.isInteger(percentage)) {
      return `${percentage}%`
    }

    return `${percentage.toFixed(2).replace(/\.?0+$/, '')}%`
  }

  function calculateWeightedPoints(punkte: number, anteil: number) {
    return punkte * anteil
  }

  function formatWeightedPoints(punkte: number, anteil: number) {
    return calculateWeightedPoints(punkte, anteil).toFixed(2)
  }

  return {
    formatPercentage,
    calculateWeightedPoints,
    formatWeightedPoints
  }
}
