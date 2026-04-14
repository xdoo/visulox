<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'

import {
  buildTenderValueScoreRows,
  formatNormalizedCost,
  formatUtilityPercentage,
  formatValueScore,
  formatValueScoreCost
} from '../../composables/useTenderValueScore'

import type {
  TenderCostBlock,
  TenderSection,
  TenderSettings,
  TenderVendor,
  TenderVendorCostItem
} from '../../../shared/types/tenders'

const props = defineProps<{
  vendors: TenderVendor[]
  sections: TenderSection[]
  scoreRange: TenderSettings['scoreRange']
  costBlocks: TenderCostBlock[]
  vendorCostItems: TenderVendorCostItem[]
  considerationYears: TenderSettings['considerationYears']
}>()

const columns: TableColumn<ReturnType<typeof buildTenderValueScoreRows>[number]>[] = [
  {
    accessorKey: 'rank',
    header: 'Rang',
    meta: {
      class: {
        th: 'w-16 text-right',
        td: 'w-16 text-right font-medium'
      }
    }
  },
  {
    accessorKey: 'vendorName',
    header: 'Anbieter'
  },
  {
    accessorKey: 'utilityPercentage',
    header: 'Nutzen',
    meta: {
      class: {
        th: 'w-28 text-right',
        td: 'w-28 text-right'
      }
    }
  },
  {
    accessorKey: 'totalCost',
    header: 'Gesamtkosten',
    meta: {
      class: {
        th: 'w-40 text-right',
        td: 'w-40 text-right'
      }
    }
  },
  {
    accessorKey: 'normalizedCost',
    header: 'Kosten normiert',
    meta: {
      class: {
        th: 'w-32 text-right',
        td: 'w-32 text-right'
      }
    }
  },
  {
    accessorKey: 'score',
    header: 'Score',
    meta: {
      class: {
        th: 'w-32 text-right',
        td: 'w-32 text-right font-semibold'
      }
    }
  }
]

const rows = computed(() => buildTenderValueScoreRows(
  props.vendors,
  props.sections,
  props.scoreRange,
  props.costBlocks,
  props.vendorCostItems,
  props.considerationYears
))

const hasRankableRows = computed(() => rows.value.some((row) => row.score !== null))
const hasMissingCostRows = computed(() => rows.value.some((row) => row.score === null))
</script>

<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h3 class="font-semibold text-lg">
          Value Score
        </h3>
        <p class="text-sm ui-text-muted">
          Der Value Score kombiniert Nutzen und Gesamtkosten über den Betrachtungszeitraum von {{ props.considerationYears }} Jahren.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-lucide-calculator"
        :ui="{
          icon: 'size-11'
        }"
        description="Score = 0,5 x Nutzen_norm + 0,5 x Kosten_norm. Der Nutzen wird aus der gewichteten Kriterienerfüllung auf 0 bis 1 normiert. Die Kosten werden relativ zum günstigsten Anbieter normiert."
        title="Berechnungslogik"
      />

      <UAlert
        v-if="hasMissingCostRows"
        color="warning"
        variant="subtle"
        title="Nicht vollständig berechenbar"
        description="Für Anbieter ohne valide Gesamtkosten größer 0 kann kein Value Score berechnet werden."
      />

      <div
        v-if="!hasRankableRows"
        class="flex h-64 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
      >
        Für den Value Score werden sowohl gewichtete Kriterienerfüllung als auch Gesamtkosten benötigt.
      </div>

      <UTable
        v-else
        :data="rows"
        :columns="columns"
      >
        <template #rank-cell="{ row }">
          {{ row.original.rank ?? '–' }}
        </template>

        <template #utilityPercentage-cell="{ row }">
          {{ formatUtilityPercentage(row.original.utilityPercentage) }}
        </template>

        <template #totalCost-cell="{ row }">
          {{ formatValueScoreCost(row.original.totalCost) }}
        </template>

        <template #normalizedCost-cell="{ row }">
          {{ formatNormalizedCost(row.original.normalizedCost) }}
        </template>

        <template #score-cell="{ row }">
          {{ formatValueScore(row.original.score) }}
        </template>
      </UTable>
    </div>
  </UCard>
</template>
