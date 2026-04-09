import { computed } from 'vue'

import type { NavigationMenuItem } from '@nuxt/ui'

export function useAusschreibungenNavigation() {
  const route = useRoute()
  const {
    items: ausschreibungen,
    latestAusschreibungName,
    loadAusschreibungen,
    getAusschreibungPath,
    findAusschreibungById
  } = useAusschreibungen()

  const overviewLinks = computed<NavigationMenuItem[]>(() => [{
    label: 'Ausschreibungen',
    icon: 'i-heroicons-home',
    to: '/'
  }])

  function getAusschreibungOverviewPath(id: string) {
    return getAusschreibungPath(id)
  }

  function getAusschreibungKriterienkatalogPath(id: string) {
    return `${getAusschreibungPath(id)}/kriterienkatalog`
  }

  function getAusschreibungKostenPath(id: string) {
    return `${getAusschreibungPath(id)}/kosten`
  }

  const ausschreibungLinks = computed<NavigationMenuItem[]>(() => {
    return ausschreibungen.value.map((item) => ({
      label: item.name,
      icon: 'i-heroicons-document-text',
      to: getAusschreibungOverviewPath(item.id),
      children: [
        {
          label: 'Kriterienkatalog',
          icon: 'i-heroicons-list-bullet',
          to: getAusschreibungKriterienkatalogPath(item.id)
        },
        {
          label: 'Kosten',
          icon: 'i-heroicons-currency-euro',
          to: getAusschreibungKostenPath(item.id)
        }
      ]
    }))
  })

  const settingsLinks = computed<NavigationMenuItem[]>(() => [{
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/settings'
  }])

  const currentAusschreibung = computed(() => {
    const ausschreibungId = typeof route.params.id === 'string' ? route.params.id : ''

    if (!ausschreibungId) {
      return null
    }

    return findAusschreibungById(ausschreibungId)
  })

  const breadcrumbItems = computed(() => {
    const items: Array<{ label: string, icon?: string, to: string }> = [
      { label: 'Home', icon: 'i-heroicons-home', to: '/' }
    ]

    if (route.path === '/settings') {
      items.push({ label: 'Settings', to: '/settings' })
    } else if (currentAusschreibung.value) {
      items.push({
        label: currentAusschreibung.value.name,
        to: getAusschreibungPath(currentAusschreibung.value.id)
      })

      if (route.path === getAusschreibungKriterienkatalogPath(currentAusschreibung.value.id)) {
        items.push({
          label: 'Kriterienkatalog',
          to: getAusschreibungKriterienkatalogPath(currentAusschreibung.value.id)
        })
      } else if (route.path === getAusschreibungKostenPath(currentAusschreibung.value.id)) {
        items.push({
          label: 'Kosten',
          to: getAusschreibungKostenPath(currentAusschreibung.value.id)
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

    if (currentAusschreibung.value) {
      if (route.path === getAusschreibungKriterienkatalogPath(currentAusschreibung.value.id)) {
        return 'Kriterienkatalog'
      }

      if (route.path === getAusschreibungKostenPath(currentAusschreibung.value.id)) {
        return 'Kosten'
      }
    }

    if (currentAusschreibung.value) {
      return currentAusschreibung.value.name
    }

    return latestAusschreibungName.value
  })

  return {
    loadAusschreibungen,
    overviewLinks,
    ausschreibungLinks,
    settingsLinks,
    breadcrumbItems,
    currentTitle
  }
}
