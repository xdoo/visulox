<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const links = computed<NavigationMenuItem[]>(() => [{
  label: 'Ausschreibungen',
  icon: 'i-heroicons-home',
  to: '/',
  active: route.path === '/'
}, {
  label: 'Settings',
  icon: 'i-heroicons-cog-6-tooth',
  to: '/settings',
  active: route.path === '/settings'
}])

const breadcrumbItems = computed(() => {
  const items = [{ label: 'Home', icon: 'i-heroicons-home', to: '/' }]
  if (route.path === '/settings') {
    items.push({ label: 'Settings', to: '/settings' })
  } else {
    items.push({ label: 'Ausschreibungen', to: '/' })
  }
  return items
})

const currentTitle = computed(() => {
  return route.path === '/settings' ? 'Settings' : 'Ausschreibungen'
})
</script>

<template>
  <UApp>
    <div class="flex h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <!-- USidebar als Container -->
      <USidebar class="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 w-64">
        <template #header>
          <div class="h-14 flex items-center px-4 shrink-0">
            <span class="font-bold text-lg tracking-tight italic">Visulox</span>
          </div>
        </template>

        <!-- Die Navigation wird als Slot oder Kind-Komponente eingefügt -->
        <div class="flex-1 overflow-y-auto p-3">
          <UNavigationMenu :items="links" orientation="vertical" />
        </div>

        <template #footer>
          <div class="p-4 shrink-0">
            <UUser
              name="Benjamin Canac"
              description="ben@nuxtlabs.com"
              avatar="https://avatars.githubusercontent.com/u/739984?v=4"
            />
          </div>
        </template>
      </USidebar>

      <!-- Main Content area -->
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur shrink-0">
          <div class="flex items-center gap-2 font-medium">
            {{ currentTitle }}
          </div>
          <div class="flex items-center gap-1">
            <UButton icon="i-heroicons-magnifying-glass" color="neutral" variant="ghost" />
            <UButton icon="i-heroicons-bell" color="neutral" variant="ghost" />
            <UColorModeButton />
          </div>
        </header>

        <div class="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <UBreadcrumb :items="breadcrumbItems" />
        </div>

        <main class="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-900/30">
          <slot />
        </main>
      </div>
    </div>
  </UApp>
</template>

<style>
html, body, #__nuxt {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
