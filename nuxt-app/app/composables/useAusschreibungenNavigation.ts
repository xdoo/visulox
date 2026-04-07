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
    to: '/',
    active: route.path === '/'
  }])

  const ausschreibungLinks = computed<NavigationMenuItem[]>(() => {
    return ausschreibungen.value.map((item) => ({
      label: item.name,
      icon: 'i-heroicons-document-text',
      to: getAusschreibungPath(item.id),
      active: route.path === getAusschreibungPath(item.id)
    }))
  })

  const settingsLinks = computed<NavigationMenuItem[]>(() => [{
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/settings',
    active: route.path === '/settings'
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
