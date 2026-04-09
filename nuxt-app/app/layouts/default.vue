<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'

const isTenderCreateModalOpen = ref(false)
const {
  loadTenders,
  overviewLinks,
  tenderLinks,
  settingsLinks,
  breadcrumbItems,
  currentTitle
} = useTendersNavigation()

await callOnce(async () => {
  await loadTenders()
})

// Shortcut: Shift + N öffnet das Modal
onKeyStroke(['N'], (e) => {
  if (e.shiftKey && !isTenderCreateModalOpen.value) {
    e.preventDefault()
    isTenderCreateModalOpen.value = true
  }
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

          <div v-if="tenderLinks.length > 0" class="space-y-3">
            <hr class="ui-border">
            <UNavigationMenu :items="tenderLinks" orientation="vertical" />
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
              @click="isTenderCreateModalOpen = true"
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

    <TenderCreateModal v-model:open="isTenderCreateModalOpen" />
  </div>
</template>
