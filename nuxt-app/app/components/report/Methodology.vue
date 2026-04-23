<script setup lang="ts">
import { tenderCostBlockTypeLabels } from '~~/shared/constants/cost-blocks'

import type { TenderCostBlock, TenderSection, TenderSettings, TenderVendor } from '~~/shared/types/tenders'

const props = defineProps<{
  vendors: TenderVendor[]
  sections: TenderSection[]
  costBlocks: TenderCostBlock[]
  scoreRange: TenderSettings['scoreRange']
  considerationYears: TenderSettings['considerationYears']
}>()

const projectCostBlocks = computed(() => props.costBlocks.filter((costBlock) => (
  costBlock.type === 'license_one_time' || costBlock.type === 'project'
)))
const runCostBlocks = computed(() => props.costBlocks.filter((costBlock) => (
  costBlock.type === 'vendor_operating' || costBlock.type === 'infrastructure'
)))
const totalSectionWeight = computed(() => props.sections.reduce((sum, section) => sum + section.weight, 0))
</script>

<template>
  <section class="report-methodology">
    <div class="methodology-block">
      <h3>Teilnehmende Anbieter</h3>
      <p>
        Die Bewertung vergleicht die folgenden Anbieter:
      </p>
      <ul class="vendor-list">
        <li
          v-for="vendor in props.vendors"
          :key="vendor.id"
        >
          {{ vendor.name }}
        </li>
      </ul>
    </div>

    <div class="methodology-block">
      <h3>Bewertungsdimensionen</h3>
      <p>
        Die Ausschreibung trennt fachlichen Nutzen und Kosten bewusst voneinander. Der Kriterienkatalog beschreibt,
        wie gut ein Anbieter die fachlichen Anforderungen erfüllt. Die Kostenbewertung zeigt, welche wirtschaftliche
        Belastung durch einmalige Projektkosten und laufende Run-Kosten entsteht.
      </p>
    </div>

    <div class="methodology-block">
      <h3>Kriterienkatalog</h3>
      <p>
        Der Kriterienkatalog ist in gewichtete Kategorien gegliedert. Die Gewichtung zeigt, wie stark eine Kategorie
        in die fachliche Gesamtbewertung eingeht. Bewertungen erfolgen auf einer Skala von
        {{ props.scoreRange[0] }} bis {{ props.scoreRange[1] }}.
      </p>

      <table>
        <thead>
          <tr>
            <th>Kategorie</th>
            <th class="numeric">Gewicht</th>
            <th>Bewertung durchgeführt durch</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="section in props.sections"
            :key="section.id"
          >
            <td>{{ section.name }}</td>
            <td class="numeric">{{ Math.round(section.weight) }}%</td>
            <td class="evaluators-cell" :class="{ muted: !section.evaluators }">
              {{ section.evaluators || 'TODO: Verantwortliche Bewertung noch nicht erfasst' }}
            </td>
          </tr>
          <tr class="summary-row">
            <td>Summe</td>
            <td class="numeric">{{ Math.round(totalSectionWeight) }}%</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>

    <div class="methodology-block">
      <h3>Kostenmethodik</h3>
      <p>
        Projektkosten sind einmalige oder projektbezogene Kosten, die typischerweise während Einführung, Lizenzierung
        oder Umsetzung anfallen. Run-Kosten sind laufende Kosten nach Projektabschluss. Für diese Ausschreibung werden
        Run-Kosten über {{ props.considerationYears }} Jahre betrachtet.
      </p>
    </div>

    <div class="methodology-grid">
      <div class="methodology-block">
        <h3>Kostenarten im Projekt</h3>
        <table>
          <thead>
            <tr>
              <th>Kostenblock</th>
              <th>Kostenart</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="costBlock in projectCostBlocks"
              :key="costBlock.id"
            >
              <td>{{ costBlock.name }}</td>
              <td>{{ tenderCostBlockTypeLabels[costBlock.type] }}</td>
            </tr>
            <tr v-if="projectCostBlocks.length === 0">
              <td colspan="2" class="muted">Keine Projektkostenarten gepflegt.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="methodology-block">
        <h3>Kostenarten im Run</h3>
        <p>
          Betrachtungszeitraum: {{ props.considerationYears }} Jahre.
        </p>
        <table>
          <thead>
            <tr>
              <th>Kostenblock</th>
              <th>Kostenart</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="costBlock in runCostBlocks"
              :key="costBlock.id"
            >
              <td>{{ costBlock.name }}</td>
              <td>{{ tenderCostBlockTypeLabels[costBlock.type] }}</td>
            </tr>
            <tr v-if="runCostBlocks.length === 0">
              <td colspan="2" class="muted">Keine Run-Kostenarten gepflegt.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.report-methodology {
  display: flex;
  flex-direction: column;
  gap: 7mm;
}

.methodology-block {
  break-inside: avoid;
}

.methodology-grid {
  display: flex;
  flex-direction: column;
  gap: 8mm;
}

h3 {
  color: #111827;
  font-size: 14pt;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 2mm;
}

p {
  color: #374151;
  font-size: 10pt;
  line-height: 1.45;
  margin: 0 0 3mm;
}

.vendor-list {
  columns: 2;
  color: #111827;
  font-size: 10pt;
  line-height: 1.5;
  margin: 0;
  padding-left: 5mm;
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

.muted {
  color: #6b7280;
}

.evaluators-cell {
  white-space: pre-line;
}

.summary-row td {
  font-weight: 700;
}
</style>
