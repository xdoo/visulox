export type TenderSubpage = 'overview' | 'criteria' | 'costs' | 'settings'

export function getTenderPath(id: string) {
  return `/tenders/${id}`
}

export function getTenderCriteriaPath(id: string) {
  return `${getTenderPath(id)}/criteria`
}

export function getTenderCostsPath(id: string) {
  return `${getTenderPath(id)}/costs`
}

export function getTenderSettingsPath(id: string) {
  return `${getTenderPath(id)}/settings`
}

export function resolveTenderSubpage(path: string, tenderId: string): TenderSubpage | null {
  const normalizedTenderId = tenderId.trim()

  if (!normalizedTenderId) {
    return null
  }

  if (path === getTenderPath(normalizedTenderId)) {
    return 'overview'
  }

  if (path === getTenderCriteriaPath(normalizedTenderId)) {
    return 'criteria'
  }

  if (path === getTenderCostsPath(normalizedTenderId)) {
    return 'costs'
  }

  if (path === getTenderSettingsPath(normalizedTenderId)) {
    return 'settings'
  }

  return null
}
