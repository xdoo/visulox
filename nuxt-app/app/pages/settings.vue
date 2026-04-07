<script setup lang="ts">
useSeoMeta({
  title: 'Settings'
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Settings</h2>
      <p class="text-gray-500 dark:text-gray-400">Manage your account settings and preferences.</p>
    </div>
    
    <div class="grid gap-6">
      <UCard>
        <template #header>
          <h3 class="font-semibold">General</h3>
        </template>
        <p class="text-sm text-gray-500">Settings related to your profile and account information.</p>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold">Appearance</h3>
        </template>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Dark Mode</span>
          <UColorModeSwitch />
        </div>
      </UCard>
    </div>
  </div>
</template>
