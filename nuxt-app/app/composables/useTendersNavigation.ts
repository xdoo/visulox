import { computed } from 'vue'

import {
  getTenderCostsPath,
  getTenderCriteriaCatalogPath,
  getTenderCriteriaPath,
  getTenderPath,
  getTenderSettingsPath,
  getTenderSummaryPath,
  resolveTenderSubpage
} from './useTenderPaths'

import type { NavigationMenuItem } from '@nuxt/ui'

export function useTendersNavigation() {
  const route = useRoute()
  const {
    items: tenders,
    latestTenderName,
    loadTenders,
    findTenderById
  } = useTenders()

  const overviewLinks = computed<NavigationMenuItem[]>(() => [{
    label: 'Ausschreibungen',
    icon: 'i-lucide-house',
    to: '/'
  }])

  const tenderLinks = computed<NavigationMenuItem[]>(() => {
    return tenders.value.map((item) => ({
      label: item.name,
      icon: 'i-lucide-file-text',
      to: getTenderPath(item.id),
      children: [
        ...(item.criteriaCatalogs && item.criteriaCatalogs.length > 0
          ? item.criteriaCatalogs.map((catalog) => ({
            label: catalog.name,
            icon: 'i-lucide-list-checks',
            to: getTenderCriteriaCatalogPath(item.id, catalog.id)
          }))
          : [{
            label: 'Kriterienkatalog',
            icon: 'i-lucide-list-checks',
            to: getTenderCriteriaPath(item.id)
          }]),
        {
          label: 'Kosten',
          icon: 'i-lucide-badge-euro',
          to: getTenderCostsPath(item.id)
        },
        {
          label: 'Zusammenfassung',
          icon: 'i-lucide-file-chart-column',
          to: getTenderSummaryPath(item.id)
        },
        {
          label: 'Settings',
          icon: 'i-lucide-settings-2',
          to: getTenderSettingsPath(item.id)
        }
      ]
    }))
  })

  const settingsLinks = computed<NavigationMenuItem[]>(() => [{
    label: 'Settings',
    icon: 'i-lucide-settings-2',
    to: '/settings'
  }])

  const currentTender = computed(() => {
    const tenderId = typeof route.params.id === 'string' ? route.params.id : ''

    if (!tenderId) {
      return null
    }

    return findTenderById(tenderId)
  })

  const currentTenderSubpage = computed(() => {
    if (!currentTender.value) {
      return null
    }

    return resolveTenderSubpage(route.path, currentTender.value.id)
  })

  const currentCriteriaCatalog = computed(() => {
    if (!currentTender.value) {
      return null
    }

    const catalogId = typeof route.params.catalogId === 'string' ? route.params.catalogId : ''
    if (!catalogId) {
      return currentTender.value.criteriaCatalogs?.[0] || null
    }

    return currentTender.value.criteriaCatalogs?.find((catalog) => catalog.id === catalogId) || null
  })

  const breadcrumbItems = computed(() => {
    const items: Array<{ label: string, icon?: string, to: string }> = [
      { label: 'Home', icon: 'i-lucide-house', to: '/' }
    ]

    if (route.path === '/settings') {
      items.push({ label: 'Settings', to: '/settings' })
    } else if (currentTender.value) {
      items.push({
        label: currentTender.value.name,
        to: getTenderPath(currentTender.value.id)
      })

      if (currentTenderSubpage.value === 'criteria') {
        items.push({
          label: currentCriteriaCatalog.value?.name || 'Kriterienkatalog',
          to: currentCriteriaCatalog.value
            ? getTenderCriteriaCatalogPath(currentTender.value.id, currentCriteriaCatalog.value.id)
            : getTenderCriteriaPath(currentTender.value.id)
        })
      } else if (currentTenderSubpage.value === 'costs') {
        items.push({
          label: 'Kosten',
          to: getTenderCostsPath(currentTender.value.id)
        })
      } else if (currentTenderSubpage.value === 'summary') {
        items.push({
          label: 'Zusammenfassung',
          to: getTenderSummaryPath(currentTender.value.id)
        })
      } else if (currentTenderSubpage.value === 'settings') {
        items.push({
          label: 'Settings',
          to: getTenderSettingsPath(currentTender.value.id)
        })
      }
    } else {
      items.push({ label: 'Ausschreibungen', to: '/' })
    }

    return items
  })

  const currentTitle = computed(() => {
    if (route.path === '/settings') {
      return 'Settings'
    }

    if (currentTender.value) {
      if (currentTenderSubpage.value === 'criteria') {
        return currentCriteriaCatalog.value?.name || 'Kriterienkatalog'
      }

      if (currentTenderSubpage.value === 'costs') {
        return 'Kosten'
      }

      if (currentTenderSubpage.value === 'summary') {
        return 'Zusammenfassung'
      }

      if (currentTenderSubpage.value === 'settings') {
        return 'Settings'
      }
    }

    if (currentTender.value) {
      return currentTender.value.name
    }

    return latestTenderName.value
  })

  return {
    loadTenders,
    overviewLinks,
    tenderLinks,
    settingsLinks,
    breadcrumbItems,
    currentTitle
  }
}
