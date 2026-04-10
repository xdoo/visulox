import { computed } from 'vue'

import {
  getTenderCostsPath,
  getTenderCriteriaPath,
  getTenderPath,
  getTenderSettingsPath,
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
    icon: 'i-heroicons-home',
    to: '/'
  }])

  const tenderLinks = computed<NavigationMenuItem[]>(() => {
    return tenders.value.map((item) => ({
      label: item.name,
      icon: 'i-heroicons-document-text',
      to: getTenderPath(item.id),
      children: [
        {
          label: 'Kriterienkatalog',
          icon: 'i-heroicons-list-bullet',
          to: getTenderCriteriaPath(item.id)
        },
        {
          label: 'Kosten',
          icon: 'i-heroicons-currency-euro',
          to: getTenderCostsPath(item.id)
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

  const breadcrumbItems = computed(() => {
    const items: Array<{ label: string, icon?: string, to: string }> = [
      { label: 'Home', icon: 'i-heroicons-home', to: '/' }
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
          label: 'Kriterienkatalog',
          to: getTenderCriteriaPath(currentTender.value.id)
        })
      } else if (currentTenderSubpage.value === 'costs') {
        items.push({
          label: 'Kosten',
          to: getTenderCostsPath(currentTender.value.id)
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
        return 'Kriterienkatalog'
      }

      if (currentTenderSubpage.value === 'costs') {
        return 'Kosten'
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
