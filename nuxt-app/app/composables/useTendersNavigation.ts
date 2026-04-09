import { computed } from 'vue'

import type { NavigationMenuItem } from '@nuxt/ui'

export function useTendersNavigation() {
  const route = useRoute()
  const {
    items: tenders,
    latestTenderName,
    loadTenders,
    getTenderPath,
    findTenderById
  } = useTenders()

  const overviewLinks = computed<NavigationMenuItem[]>(() => [{
    label: 'Ausschreibungen',
    icon: 'i-heroicons-home',
    to: '/'
  }])

  function getTenderOverviewPath(id: string) {
    return getTenderPath(id)
  }

  function getTenderCriteriaPath(id: string) {
    return `${getTenderPath(id)}/criteria`
  }

  function getTenderCostsPath(id: string) {
    return `${getTenderPath(id)}/costs`
  }

  const tenderLinks = computed<NavigationMenuItem[]>(() => {
    return tenders.value.map((item) => ({
      label: item.name,
      icon: 'i-heroicons-document-text',
      to: getTenderOverviewPath(item.id),
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
        }
      ]
    }))
  })

  const settingsLinks = computed<NavigationMenuItem[]>(() => [{
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/settings'
  }])

  const currentTender = computed(() => {
    const tenderId = typeof route.params.id === 'string' ? route.params.id : ''

    if (!tenderId) {
      return null
    }

    return findTenderById(tenderId)
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

      if (route.path === getTenderCriteriaPath(currentTender.value.id)) {
        items.push({
          label: 'Kriterienkatalog',
          to: getTenderCriteriaPath(currentTender.value.id)
        })
      } else if (route.path === getTenderCostsPath(currentTender.value.id)) {
        items.push({
          label: 'Kosten',
          to: getTenderCostsPath(currentTender.value.id)
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
      if (route.path === getTenderCriteriaPath(currentTender.value.id)) {
        return 'Kriterienkatalog'
      }

      if (route.path === getTenderCostsPath(currentTender.value.id)) {
        return 'Kosten'
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
