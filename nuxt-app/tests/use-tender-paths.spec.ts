import { describe, expect, it } from 'vitest'

import {
  getTenderCostsPath,
  getTenderCriteriaPath,
  getTenderPath,
  getTenderSettingsPath,
  resolveTenderSubpage
} from '../app/composables/useTenderPaths'

describe('useTenderPaths helpers', () => {
  it('builds tender subpage paths consistently', () => {
    expect(getTenderPath('7')).toBe('/tenders/7')
    expect(getTenderCriteriaPath('7')).toBe('/tenders/7/criteria')
    expect(getTenderCostsPath('7')).toBe('/tenders/7/costs')
    expect(getTenderSettingsPath('7')).toBe('/tenders/7/settings')
  })

  it('resolves the current tender subpage from a route path', () => {
    expect(resolveTenderSubpage('/tenders/7', '7')).toBe('overview')
    expect(resolveTenderSubpage('/tenders/7/criteria', '7')).toBe('criteria')
    expect(resolveTenderSubpage('/tenders/7/costs', '7')).toBe('costs')
    expect(resolveTenderSubpage('/tenders/7/settings', '7')).toBe('settings')
    expect(resolveTenderSubpage('/settings', '7')).toBeNull()
  })
})
