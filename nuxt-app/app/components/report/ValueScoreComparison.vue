<script setup lang="ts">
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

const highestBalancedScore = computed(() => getHighestScoreValue(props.rows, 'balancedScore'))
const highestCostFocusScore = computed(() => getHighestScoreValue(props.rows, 'costFocusScore'))
const highestCostFocusThirtySeventyScore = computed(() => getHighestScoreValue(props.rows, 'costFocusThirtySeventyScore'))
const highestCostFocusTwentyEightyScore = computed(() => getHighestScoreValue(props.rows, 'costFocusTwentyEightyScore'))
const highestUtilityFocusScore = computed(() => getHighestScoreValue(props.rows, 'utilityFocusScore'))
const highestUtilityFocusSeventyThirtyScore = computed(() => getHighestScoreValue(props.rows, 'utilityFocusSeventyThirtyScore'))
const highestUtilityFocusEightyTwentyScore = computed(() => getHighestScoreValue(props.rows, 'utilityFocusEightyTwentyScore'))
const hasRankableRows = computed(() => props.rows.some((row) => row.balancedScore !== null))
const hasMissingCostRows = computed(() => props.rows.some((row) => row.balancedScore === null))

function getWinningClass(value: number | null, highestValue: number | null) {
  return value !== null && highestValue !== null && value === highestValue ? 'report-winner' : ''
}
</script>

<template>
  <section class="report-value-score">
    <div class="report-explanation">
      <h3>Berechnungslogik</h3>
      <p>
        Der Gesamtvergleich kombiniert fachlichen Nutzen und Kosten zu einer gemeinsamen Kennzahl.
        Der Nutzen wird aus der gewichteten Kriterienbewertung abgeleitet und auf eine Skala von 0 bis 1 normiert.
        Die Kosten werden relativ zum günstigsten Anbieter bewertet: Der günstigste Anbieter erhält den Kostenwert 1,00,
        teurere Anbieter entsprechend niedrigere Werte.
      </p>
      <p>
        Der Balanced Score gewichtet Nutzen und Kosten jeweils mit 50 Prozent:
        <strong>Score = 0,5 x Nutzen_norm + 0,5 x Kosten_norm</strong>.
        Die Betrachtung der Kosten erfolgt über 7 Jahre.
      </p>
      <p>
        Ergänzend werden alternative Gewichtungsszenarien betrachtet (z. B. stärker kosten- oder nutzengetrieben),
        um die Sensitivität der Rangfolge zu analysieren und die Robustheit der Entscheidung zu bewerten.
      </p>
    </div>

    <p v-if="hasMissingCostRows" class="report-warning">
      Anbieter ohne valide Gesamtkosten größer 0 können im Value Score nicht vollständig berechnet werden.
    </p>

    <div
      v-if="!hasRankableRows"
      class="report-empty"
    >
      Für den Value Score werden sowohl gewichtete Kriterienerfüllung als auch Gesamtkosten benötigt.
    </div>

    <template v-else>
      <div class="report-table-block">
        <h3>Vergleichsgrundlage Nutzen und Kosten</h3>
        <p>
          Die Tabelle zeigt die normierten Kosten und den normierten Nutzen je Anbieter sowie den daraus abgeleiteten
          Balanced Score als kombinierte Kennzahl. Die Werte bilden die Grundlage für die anschließende Visualisierung
          und den Gesamtvergleich.
        </p>

        <table>
          <thead>
            <tr>
              <th>Anbieter</th>
              <th class="numeric">Nutzen</th>
              <th class="numeric">Nutzen norm.</th>
              <th class="numeric">Gesamtkosten</th>
              <th class="numeric">Kosten norm.</th>
              <th class="numeric">Balanced</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in props.rows"
              :key="`basis-${row.vendorId}`"
            >
              <td>{{ row.vendorName }}</td>
              <td class="numeric">{{ formatUtilityPercentage(row.utilityPercentage) }}</td>
              <td class="numeric">{{ formatValueScore(row.normalizedUtility) }}</td>
              <td class="numeric">{{ formatValueScoreCost(row.totalCost) }}</td>
              <td class="numeric">{{ formatNormalizedCost(row.normalizedCost) }}</td>
              <td class="numeric" :class="getWinningClass(row.balancedScore, highestBalancedScore)">
                {{ formatValueScore(row.balancedScore) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <slot name="positioning" />

      <div class="report-table-block">
        <h3>Sensitivität der Gewichtung</h3>
        <p>
          Die Tabelle zeigt, wie robust die Rangfolge bleibt, wenn Kosten oder Nutzen stärker gewichtet werden.
          Der Kostenfokus bewertet Nutzen mit 40 Prozent und Kosten mit 60 Prozent.
          Der Nutzenfokus bewertet Nutzen mit 60 Prozent und Kosten mit 40 Prozent.
          Stabile Spitzenpositionen über mehrere Szenarien hinweg stärken die Belastbarkeit der Entscheidung.
        </p>

        <table>
          <thead>
            <tr>
              <th>Anbieter</th>
              <th class="numeric">Balanced 50/50</th>
              <th class="numeric">Kostenfokus 40/60</th>
              <th class="numeric">Nutzenfokus 60/40</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in props.rows"
              :key="`sensitivity-${row.vendorId}`"
            >
              <td>{{ row.vendorName }}</td>
              <td class="numeric" :class="getWinningClass(row.balancedScore, highestBalancedScore)">
                {{ formatValueScore(row.balancedScore) }}
              </td>
              <td class="numeric" :class="getWinningClass(row.costFocusScore, highestCostFocusScore)">
                {{ formatValueScore(row.costFocusScore) }}
              </td>
              <td class="numeric" :class="getWinningClass(row.utilityFocusScore, highestUtilityFocusScore)">
                {{ formatValueScore(row.utilityFocusScore) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="report-table-block">
        <h3>Erweiterte Sensitivität der Gewichtung</h3>
        <p>
          Die zusätzliche Tabelle zeigt die Rangstabilität bei stärker ausgeprägten Kosten- und Nutzenfoki.
          Damit wird sichtbar, welche Anbieter auch bei klarer Priorisierung einer Dimension konsistent vorne bleiben.
        </p>

        <table>
          <thead>
            <tr>
              <th>Anbieter</th>
              <th class="numeric">Kostenfokus 30/70</th>
              <th class="numeric">Kostenfokus 20/80</th>
              <th class="numeric">Nutzenfokus 30/70</th>
              <th class="numeric">Nutzenfokus 20/80</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in props.rows"
              :key="`sensitivity-extended-${row.vendorId}`"
            >
              <td>{{ row.vendorName }}</td>
              <td class="numeric" :class="getWinningClass(row.costFocusThirtySeventyScore, highestCostFocusThirtySeventyScore)">
                {{ formatValueScore(row.costFocusThirtySeventyScore) }}
              </td>
              <td class="numeric" :class="getWinningClass(row.costFocusTwentyEightyScore, highestCostFocusTwentyEightyScore)">
                {{ formatValueScore(row.costFocusTwentyEightyScore) }}
              </td>
              <td class="numeric" :class="getWinningClass(row.utilityFocusSeventyThirtyScore, highestUtilityFocusSeventyThirtyScore)">
                {{ formatValueScore(row.utilityFocusSeventyThirtyScore) }}
              </td>
              <td class="numeric" :class="getWinningClass(row.utilityFocusEightyTwentyScore, highestUtilityFocusEightyTwentyScore)">
                {{ formatValueScore(row.utilityFocusEightyTwentyScore) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <slot name="results-context" />
    </template>
  </section>
</template>

<style scoped>
.report-value-score {
  display: flex;
  flex-direction: column;
  gap: 7mm;
}

.report-explanation,
.report-table-block {
  break-inside: avoid;
}

.report-explanation h3 {
  color: #111827;
  font-size: 14pt;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 2mm;
}

.report-explanation p,
.report-table-block p {
  color: #374151;
  font-size: 10pt;
  line-height: 1.45;
  margin: 0 0 3mm;
}

.report-warning,
.report-empty {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  font-size: 10pt;
  line-height: 1.4;
  margin: 0;
  padding: 4mm;
}

table {
  border-collapse: collapse;
  font-size: 8.5pt;
  table-layout: fixed;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid #e5e7eb;
  overflow-wrap: anywhere;
  padding: 2.2mm 2mm;
  text-align: left;
  vertical-align: top;
}

th {
  background: #f9fafb;
  color: #374151;
  font-weight: 700;
}

.numeric {
  text-align: right;
}

.report-winner {
  color: var(--report-primary-color);
  font-weight: 700;
}
</style>
