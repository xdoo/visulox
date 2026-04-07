<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { onKeyStroke } from '@vueuse/core'

const route = useRoute()
const isNewTenderModalOpen = ref(false)

// Shortcut: Shift + N öffnet das Modal
onKeyStroke(['N'], (e) => {
  if (e.shiftKey && !isNewTenderModalOpen.value) {
    e.preventDefault()
    isNewTenderModalOpen.value = true
  }
})

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
    <div class="flex h-screen w-full ui-bg-surface text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      <!-- Sidebar -->
      <USidebar class="flex-shrink-0 ui-border ui-bg-muted w-64 border-r">
        <template #header>
          <div class="h-14 flex items-center px-4 shrink-0">
            <span class="font-bold text-lg tracking-tight italic">Visulox</span>
          </div>
        </template>

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
        <header class="h-14 flex items-center justify-between px-4 border-b ui-border ui-bg-surface backdrop-blur shrink-0">
          <div class="flex items-center gap-2 font-medium">
            {{ currentTitle }}
          </div>
          <div class="flex items-center gap-2">
            <!-- Neuer Button: Image/Icon Button mit Tooltip -->
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

        <div class="h-12 flex items-center px-4 border-b ui-border ui-bg-surface shrink-0">
          <UBreadcrumb :items="breadcrumbItems" />
        </div>

        <main class="flex-1 overflow-y-auto p-6 bg-gray-50/10 dark:bg-gray-900/10">
          <slot />
        </main>
      </div>
    </div>

    <!-- Globales Modal -->
    <NewTenderModal v-model:open="isNewTenderModalOpen" />
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
