<script setup lang="ts">
import { buildTenderManagementSummary } from '../../composables/useTenderManagementSummary'

import type { TenderValueScoreRow } from '../../composables/useTenderValueScore'

const props = defineProps<{
  rows: TenderValueScoreRow[]
  considerationYears: number
}>()

const summary = computed(() => buildTenderManagementSummary(props.rows))
</script>

<template>
  <section v-if="summary.topVendors" class="report-management-summary">
    <div>
      <h3>Empfehlung</h3>
      <p>
        Die Analyse empfiehlt, die Anbieter {{ summary.topVendors[0] }}, {{ summary.topVendors[1] }} und {{ summary.topVendors[2] }} in den Anbieterwettbewerb aufzunehmen.
      </p>
    </div>

    <div>
      <h3>Begründung der Entscheidung</h3>
      <p>
        Die Auswahl basiert auf einer kombinierten Bewertung aus fachlichem Nutzen und Kosten über einen Zeitraum von {{ props.considerationYears }} Jahren. Grundlage bildet ein Balanced Score, in dem beide Dimensionen gleich gewichtet werden (50/50), um ein ausgewogenes Verhältnis zwischen fachlicher Eignung und Wirtschaftlichkeit sicherzustellen.
      </p>
    </div>

    <div>
      <h3>Gesamtvergleich</h3>
      <p>
        Im Gesamtvergleich zeigt sich eine klare Rangfolge der Anbieter basierend auf dem kombinierten Score. {{ summary.topVendors[0] }} erreicht den höchsten Wert, gefolgt von {{ summary.topVendors[1] }} und {{ summary.topVendors[2] }}. Die nachgelagerten Anbieter weisen im Vergleich dazu deutlich geringere kombinierte Bewertungen auf.
      </p>
      <p v-if="summary.hasSignificantGap">
        Zwischen dem dritten und vierten Platz besteht ein deutlicher Abstand, sodass sich eine natürliche Trennung im Anbieterfeld ergibt.
      </p>
    </div>

    <div>
      <h3>Fachliche Einordnung</h3>
      <p>
        Die fachliche Bewertung zeigt Unterschiede in der Abdeckung der Anforderungen zwischen den Anbietern. Die führenden Anbieter erreichen im Vergleich eine deutlich höhere Erfüllung der fachlichen Kriterien, während die übrigen Anbieter in mehreren Kategorien geringere Bewertungen aufweisen.
      </p>
    </div>

    <div>
      <h3>Kosten-Einordnung</h3>
      <p>
        Die Gesamtkosten über den betrachteten Zeitraum von {{ props.considerationYears }} Jahren variieren zwischen {{ summary.minCost }} und {{ summary.maxCost }}. Die ausgewählten Anbieter decken dabei unterschiedliche Positionen im Kosten-Nutzen-Verhältnis ab und bilden somit eine geeignete Grundlage für einen vertieften Anbieterwettbewerb.
      </p>
    </div>

    <div>
      <h3>Stabilität der Entscheidung (Sensitivität)</h3>
      <p>
        {{ summary.sensitivitySentence }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.report-management-summary {
  display: flex;
  flex-direction: column;
  gap: 7mm;
}

.report-management-summary div {
  break-inside: avoid;
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
  font-size: 10.5pt;
  line-height: 1.55;
  margin: 0;
}
</style>
