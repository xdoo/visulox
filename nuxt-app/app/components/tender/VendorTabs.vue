<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { TenderVendor } from '../../../shared/types/tenders'

const props = defineProps<{
  vendors: TenderVendor[]
}>()

const activeTab = ref<string | number>('overview')

const items = computed<TabsItem[]>(() => {
  return [
    {
      label: 'Gesamtübersicht',
      value: 'overview',
      icon: 'i-heroicons-squares-2x2'
    },
    ...props.vendors.map(vendor => ({
      label: vendor.name,
      value: vendor.id,
      icon: 'i-heroicons-user'
    }))
  ]
})

function findVendorByTabValue(value: string | number) {
  return props.vendors.find(vendor => vendor.id === String(value)) || null
}

function getVendorForItemValue(value: string | number | undefined) {
  if (value === undefined) {
    return null
  }

  return findVendorByTabValue(value)
}

watch(() => props.vendors, (vendors) => {
  if (activeTab.value === 'overview') {
    return
  }

  const hasActiveVendor = vendors.some(vendor => vendor.id === String(activeTab.value))

  if (!hasActiveVendor) {
    activeTab.value = 'overview'
  }
}, { immediate: true })
</script>

<template>
  <UTabs
    v-model="activeTab"
    :items="items"
    color="neutral"
    variant="link"
    :unmount-on-hide="false"
    class="space-y-6"
  >
    <template #content="{ item }">
      <slot
        v-if="item.value === 'overview'"
        name="overview"
      />
      <slot
        v-else
        name="vendor"
        :vendor="getVendorForItemValue(item.value)"
      />
    </template>
  </UTabs>
</template>
