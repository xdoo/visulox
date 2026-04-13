<script setup lang="ts">
import type {
  TenderCostBlock,
  TenderSettings,
  TenderVendor,
  TenderVendorCostItem
} from '../../../shared/types/tenders'
import { buildVendorCostOverviewRows } from '../../composables/useTenderCostOverview'

const props = defineProps<{
  vendors: TenderVendor[]
  costBlocks: TenderCostBlock[]
  vendorCostItems: TenderVendorCostItem[]
  considerationYears: TenderSettings['considerationYears']
  palette?: TenderSettings['chartPalette']
}>()

const overviewRows = computed(() => buildVendorCostOverviewRows(
  props.vendors,
  props.costBlocks,
  props.vendorCostItems,
  props.considerationYears
))

const projectRows = computed(() => overviewRows.value.filter((row) => row.kind === 'project'))
const runRows = computed(() => overviewRows.value.filter((row) => row.kind === 'run'))
const hasProjectCosts = computed(() => projectRows.value.some((row) => row.total > 0))
const hasRunCosts = computed(() => runRows.value.some((row) => row.total > 0))
const hasAnyCosts = computed(() => hasProjectCosts.value || hasRunCosts.value)
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-lg">
          Kostenvergleich
        </h3>
      </div>
    </template>

    <div class="space-y-6">
      <p class="ui-text-muted">
        Vergleich der Projektkosten sowie der Run-Kosten über den Betrachtungszeitraum von {{ props.considerationYears }} Jahren.
      </p>

      <div v-if="hasAnyCosts" class="grid gap-6 xl:grid-cols-2">
        <UCard class="rounded-lg border ui-border bg-gray-50/50">
          <template #header>
            <div class="space-y-1">
              <h4 class="font-semibold">
                Projektkosten
              </h4>
              <p class="text-sm ui-text-muted">
                Einmalige Projekt- und Lizenzkosten im direkten Anbieter-Vergleich.
              </p>
            </div>
          </template>

          <TenderCostOverviewChart
            v-if="hasProjectCosts"
            kind="project"
            :rows="projectRows"
            :palette="props.palette"
          />

          <div
            v-else
            class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
          >
            Es wurden noch keine Projektkosten erfasst.
          </div>
        </UCard>

        <UCard class="rounded-lg border ui-border bg-gray-50/50">
          <template #header>
            <div class="space-y-1">
              <h4 class="font-semibold">
                Run-Kosten
              </h4>
              <p class="text-sm ui-text-muted">
                Laufende Kosten über {{ props.considerationYears }} Jahre im Anbieter-Vergleich.
              </p>
            </div>
          </template>

          <TenderCostOverviewChart
            v-if="hasRunCosts"
            kind="run"
            :rows="runRows"
            :palette="props.palette"
          />

          <div
            v-else
            class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
          >
            Es wurden noch keine Run-Kosten erfasst.
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
      >
        Es wurden noch keine Kosten erfasst. Der Vergleich wird angezeigt, sobald Anbieterkosten gepflegt wurden.
      </div>
    </div>
  </UCard>
</template>
