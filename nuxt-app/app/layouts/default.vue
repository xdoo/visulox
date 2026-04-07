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
  <div class="flex h-screen w-full overflow-hidden font-sans ui-bg-surface text-gray-900 dark:text-gray-100">
    <!-- Sidebar -->
    <USidebar class="w-64 flex-shrink-0 border-r ui-border ui-bg-muted">
      <template #header>
        <div class="flex h-14 shrink-0 items-center px-4">
          <span class="text-lg font-bold italic tracking-tight">Visulox</span>
        </div>
      </template>

      <div class="flex-1 overflow-y-auto p-3">
        <UNavigationMenu :items="links" orientation="vertical" />
      </div>

      <template #footer>
        <div class="shrink-0 p-4">
          <UUser
            name="Benjamin Canac"
            description="ben@nuxtlabs.com"
            avatar="https://avatars.githubusercontent.com/u/739984?v=4"
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
