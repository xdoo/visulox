<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { onKeyStroke } from '@vueuse/core'

const route = useRoute()
const isNewTenderModalOpen = ref(false)
const {
  items: ausschreibungen,
  latestAusschreibungName,
  loadAusschreibungen,
  getAusschreibungPath,
  findAusschreibungById
} = useAusschreibungen()

await callOnce(async () => {
  await loadAusschreibungen()
})

// Shortcut: Shift + N öffnet das Modal
onKeyStroke(['N'], (e) => {
  if (e.shiftKey && !isNewTenderModalOpen.value) {
    e.preventDefault()
    isNewTenderModalOpen.value = true
  }
})

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
  const items = [{ label: 'Home', icon: 'i-heroicons-home', to: '/' }]

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
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden font-sans ui-bg-surface text-gray-900 dark:text-gray-100">
    <!-- Sidebar -->
    <USidebar class="w-64 flex-shrink-0 border-r ui-border ui-bg-muted">
      <template #header>
        <div class="flex h-14 shrink-0 items-center px-4">
          <span class="text-lg font-bold italic tracking-tight">Visulox</span>
        </div>
      </template>

      <div class="flex-1 overflow-y-auto p-3">
        <div class="space-y-4">
          <UNavigationMenu :items="overviewLinks" orientation="vertical" />

          <div v-if="ausschreibungLinks.length > 0" class="space-y-3">
            <hr class="ui-border">
            <UNavigationMenu :items="ausschreibungLinks" orientation="vertical" />
          </div>

          <div class="space-y-3">
            <hr class="ui-border">
            <UNavigationMenu :items="settingsLinks" orientation="vertical" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="shrink-0 p-4">
          <UUser
            name="Benjamin Canac"
            description="ben@nuxtlabs.com"
            :avatar="{ src: 'https://avatars.githubusercontent.com/u/739984?v=4' }"
          />
        </div>
      </template>
    </USidebar>

    <!-- Main Content area -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-14 shrink-0 items-center justify-between border-b px-4 ui-border ui-bg-surface backdrop-blur">
        <div class="flex items-center gap-2 font-medium">
          {{ currentTitle }}
        </div>

        <div class="flex items-center gap-2">
          <UTooltip text="Neue Ausschreibung anlegen" :kbds="['shift', 'n']">
            <UButton
              icon="i-heroicons-plus-circle-20-solid"
              color="primary"
              variant="ghost"
              size="xl"
              class="rounded-full"
              @click="isNewTenderModalOpen = true"
            />
          </UTooltip>

          <UColorModeButton />
        </div>
      </header>

      <div class="flex h-12 shrink-0 items-center border-b px-4 ui-border ui-bg-surface">
        <UBreadcrumb :items="breadcrumbItems" />
      </div>

      <main class="flex-1 overflow-y-auto bg-gray-50/10 p-6 dark:bg-gray-900/10">
        <slot />
      </main>
    </div>

    <NewTenderModal v-model:open="isNewTenderModalOpen" />
  </div>
</template>
