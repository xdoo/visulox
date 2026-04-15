<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'

import {
  formatNormalizedCost,
  formatUtilityPercentage,
  formatValueScore,
  formatValueScoreCost,
  getHighestScoreValue
} from '../../composables/useTenderValueScore'

import type { TenderValueScoreRow } from '../../composables/useTenderValueScore'

const props = defineProps<{
  rows: TenderValueScoreRow[]
  considerationYears: number
}>()

const columns: TableColumn<TenderValueScoreRow>[] = [
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
    accessorKey: 'balancedScore',
    header: 'Score (Balanced)',
    meta: {
      class: {
        th: 'w-36 text-right',
        td: 'w-36 text-right'
      }
    }
  },
  {
    accessorKey: 'costFocusScore',
    header: 'Score (Kostenfokus)',
    meta: {
      class: {
        th: 'w-40 text-right',
        td: 'w-40 text-right'
      }
    }
  },
  {
    accessorKey: 'utilityFocusScore',
    header: 'Score (Nutzenfokus)',
    meta: {
      class: {
        th: 'w-40 text-right',
        td: 'w-40 text-right'
      }
    }
  }
]

const hasRankableRows = computed(() => props.rows.some((row) => row.balancedScore !== null))
const hasMissingCostRows = computed(() => props.rows.some((row) => row.balancedScore === null))
const highestBalancedScore = computed(() => getHighestScoreValue(props.rows, 'balancedScore'))
const highestCostFocusScore = computed(() => getHighestScoreValue(props.rows, 'costFocusScore'))
const highestUtilityFocusScore = computed(() => getHighestScoreValue(props.rows, 'utilityFocusScore'))

function getScoreClass(
  value: number | null,
  highestValue: number | null
) {
  return value !== null && highestValue !== null && value === highestValue ? 'font-semibold' : ''
}
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
        description="Score (Balanced) = 0,5 x Nutzen_norm + 0,5 x Kosten_norm. Zusätzlich werden ein Kostenfokus mit 40/60 und ein Nutzenfokus mit 60/40 berechnet. Sortiert wird weiterhin nur nach dem Balanced Score."
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
        :data="props.rows"
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

        <template #balancedScore-cell="{ row }">
          <span :class="getScoreClass(row.original.balancedScore, highestBalancedScore)">
            {{ formatValueScore(row.original.balancedScore) }}
          </span>
        </template>

        <template #costFocusScore-cell="{ row }">
          <span :class="getScoreClass(row.original.costFocusScore, highestCostFocusScore)">
            {{ formatValueScore(row.original.costFocusScore) }}
          </span>
        </template>

        <template #utilityFocusScore-cell="{ row }">
          <span :class="getScoreClass(row.original.utilityFocusScore, highestUtilityFocusScore)">
            {{ formatValueScore(row.original.utilityFocusScore) }}
          </span>
        </template>
      </UTable>
    </div>
  </UCard>
</template>
