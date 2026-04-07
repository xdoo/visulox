<script setup lang="ts">
const links = [{
  label: 'Dashboard',
  icon: 'i-heroicons-home',
  to: '/'
}, {
  label: 'Settings',
  icon: 'i-heroicons-cog-6-tooth',
  to: '/settings'
}]
</script>

<template>
  <UApp>
    <div class="flex h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <!-- Sidebar links -->
      <aside class="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
        <!-- Sidebar Header -->
        <div class="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <span class="font-bold text-lg tracking-tight">Visulox</span>
        </div>

        <!-- Navigation -->
        <div class="flex-1 overflow-y-auto p-3">
          <UNavigationMenu :items="links" orientation="vertical" variant="ghost" />
        </div>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <div class="flex items-center gap-3 px-2">
            <UAvatar src="https://avatars.githubusercontent.com/u/739984?v=4" size="sm" />
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-medium truncate">Benjamin Canac</span>
              <span class="text-xs text-gray-500 truncate">ben@nuxtlabs.com</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header oben -->
        <header class="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur shrink-0">
          <div class="flex items-center gap-2">
            <span class="font-medium">Dashboard</span>
          </div>
          <div class="flex items-center gap-1">
            <UButton icon="i-heroicons-magnifying-glass" color="neutral" variant="ghost" />
            <UButton icon="i-heroicons-bell" color="neutral" variant="ghost" />
            <UColorModeButton />
          </div>
        </header>

        <!-- Sub-Header / Toolbar -->
        <div class="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <UBreadcrumb :items="[{ label: 'Home', icon: 'i-heroicons-home' }, { label: 'Dashboard' }]" />
        </div>

        <!-- Content Bereich -->
        <main class="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-900/30">
          <div class="h-full border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-gray-400 font-medium italic">
            Dashboard Content Area
          </div>
        </main>
      </div>
    </div>
  </UApp>
</template>

<style>
/* Reset für volle Höhe */
html, body, #__nuxt {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
