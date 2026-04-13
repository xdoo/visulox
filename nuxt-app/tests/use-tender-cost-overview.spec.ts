import { describe, expect, it } from 'vitest'

import {
  buildCombinedVendorCostOverviewRows,
  formatCostChartMillionValue,
  buildVendorCostOverviewRows,
  formatCostChartValue
} from '../app/composables/useTenderCostOverview'

describe('useTenderCostOverview', () => {
  it('builds project and run overview rows per vendor', () => {
    const rows = buildVendorCostOverviewRows(
      [
        { id: '1', name: 'Alpha' },
        { id: '2', name: 'Beta' }
      ],
      [
        { id: '10', name: 'Lizenzen', type: 'license_one_time' },
        { id: '11', name: 'Projektteam', type: 'project' },
        { id: '12', name: 'Hosting', type: 'infrastructure' }
      ],
      [
        { id: '100', vendorId: '1', costBlockId: '10', amount: 3000 },
        { id: '101', vendorId: '1', costBlockId: '11', amount: 2000 },
        { id: '102', vendorId: '1', costBlockId: '12', amount: 500 },
        { id: '103', vendorId: '2', costBlockId: '11', amount: 1000 }
      ],
      10
    )

    expect(rows).toEqual([
      {
        id: '1-project',
        vendorId: '1',
        vendorName: 'Alpha',
        kind: 'project',
        label: 'Alpha · Projekt',
        total: 5000,
        annualTotal: 5000,
        considerationYears: 10,
        segments: [
          { costBlockId: '10', name: 'Lizenzen', type: 'license_one_time', value: 3000, annualValue: 3000 },
          { costBlockId: '11', name: 'Projektteam', type: 'project', value: 2000, annualValue: 2000 }
        ]
      },
      {
        id: '1-run',
        vendorId: '1',
        vendorName: 'Alpha',
        kind: 'run',
        label: 'Alpha · Run',
        total: 5000,
        annualTotal: 500,
        considerationYears: 10,
        segments: [
          { costBlockId: '12', name: 'Hosting', type: 'infrastructure', value: 5000, annualValue: 500 }
        ]
      },
      {
        id: '2-project',
        vendorId: '2',
        vendorName: 'Beta',
        kind: 'project',
        label: 'Beta · Projekt',
        total: 1000,
        annualTotal: 1000,
        considerationYears: 10,
        segments: [
          { costBlockId: '11', name: 'Projektteam', type: 'project', value: 1000, annualValue: 1000 }
        ]
      },
      {
        id: '2-run',
        vendorId: '2',
        vendorName: 'Beta',
        kind: 'run',
        label: 'Beta · Run',
        total: 0,
        annualTotal: 0,
        considerationYears: 10,
        segments: []
      }
    ])
  })

  it('formats chart values using german number formatting', () => {
    expect(formatCostChartValue(1234567.89)).toBe('1.234.567,89')
    expect(formatCostChartMillionValue(1234567.89)).toBe('1,2 Mio.')
  })

  it('builds combined vendor overview rows', () => {
    const rows = buildVendorCostOverviewRows(
      [
        { id: '1', name: 'Alpha' },
        { id: '2', name: 'Beta' }
      ],
      [
        { id: '10', name: 'Lizenzen', type: 'license_one_time' },
        { id: '11', name: 'Projektteam', type: 'project' },
        { id: '12', name: 'Hosting', type: 'infrastructure' }
      ],
      [
        { id: '100', vendorId: '1', costBlockId: '10', amount: 3000 },
        { id: '101', vendorId: '1', costBlockId: '11', amount: 2000 },
        { id: '102', vendorId: '1', costBlockId: '12', amount: 500 },
        { id: '103', vendorId: '2', costBlockId: '11', amount: 1000 }
      ],
      10
    )

    expect(buildCombinedVendorCostOverviewRows(rows)).toEqual([
      {
        id: '1-combined',
        vendorId: '1',
        vendorName: 'Alpha',
        kind: 'combined',
        label: 'Alpha',
        total: 10000,
        annualTotal: 5500,
        considerationYears: 10,
        segments: [
          { costBlockId: '1-project-total', name: 'Projekt', type: 'project', value: 5000, annualValue: 5000 },
          { costBlockId: '1-run-total', name: 'Run', type: 'vendor_operating', value: 5000, annualValue: 500 }
        ]
      },
      {
        id: '2-combined',
        vendorId: '2',
        vendorName: 'Beta',
        kind: 'combined',
        label: 'Beta',
        total: 1000,
        annualTotal: 1000,
        considerationYears: 10,
        segments: [
          { costBlockId: '2-project-total', name: 'Projekt', type: 'project', value: 1000, annualValue: 1000 },
          { costBlockId: '2-run-total', name: 'Run', type: 'vendor_operating', value: 0, annualValue: 0 }
        ]
      }
    ])
  })
})
