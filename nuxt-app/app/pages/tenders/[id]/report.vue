<script setup lang="ts">
import {
  calculateSectionContributionPercentage,
  calculateSectionFulfillmentPercentage
} from '../../../composables/useCriteriaSectionFulfillment'
import { buildSectionVendorComparisonRows } from '../../../composables/useTenderCategoryComparison'
import {
  buildCombinedVendorCostOverviewRows,
  buildVendorCostOverviewRows
} from '../../../composables/useTenderCostOverview'
import { buildTenderValueScoreRows } from '../../../composables/useTenderValueScore'

definePageMeta({
  layout: false
})

declare global {
  interface Window {
    __VISULOX_REPORT_READY__?: boolean
  }
}

const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const { data: tender, status, error } = await useTenderDetail(tenderId)

const valueScoreRows = computed(() => {
  if (!tender.value) {
    return []
  }

  return buildTenderValueScoreRows(
    tender.value.vendors,
    tender.value.sections,
    tender.value.settings.scoreRange,
    tender.value.costBlocks,
    tender.value.vendorCostItems,
    tender.value.settings.considerationYears
  )
})

const valueScoreChartHasData = computed(() => {
  return valueScoreRows.value.some((row) => row.balancedScore !== null && row.normalizedCost !== null)
})

const vendorScores = computed(() => {
  if (!tender.value) {
    return []
  }

  return tender.value.vendors.map(vendor => {
    let totalScore = 0
    const sectionScores = tender.value!.sections.map(section => {
      const questions = section.questionsByVendor.find(entry => entry.vendorId === vendor.id)?.questions || []
      const fulfillment = calculateSectionFulfillmentPercentage(
        questions,
        section.weight,
        tender.value!.settings.scoreRange
      ) || 0
      const contribution = calculateSectionContributionPercentage(
        questions,
        section.weight,
        tender.value!.settings.scoreRange
      ) || 0

      totalScore += contribution

      return {
        sectionId: section.id,
        sectionName: section.name,
        weight: section.weight,
        fulfillment,
        contribution
      }
    })

    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      totalScore,
      sectionScores
    }
  })
})

const hasAnyQuestions = computed(() => {
  return tender.value?.sections.some(section =>
    section.questionsByVendor.some(entry => entry.questions.length > 0)
  ) || false
})

const costOverviewRows = computed(() => {
  if (!tender.value) {
    return []
  }

  return buildVendorCostOverviewRows(
    tender.value.vendors,
    tender.value.costBlocks,
    tender.value.vendorCostItems,
    tender.value.settings.considerationYears
  )
})

const projectCostRows = computed(() => costOverviewRows.value.filter((row) => row.kind === 'project'))
const runCostRows = computed(() => costOverviewRows.value.filter((row) => row.kind === 'run'))
const combinedCostRows = computed(() => buildCombinedVendorCostOverviewRows(costOverviewRows.value))
const hasProjectCosts = computed(() => projectCostRows.value.some((row) => row.total > 0))
const hasRunCosts = computed(() => runCostRows.value.some((row) => row.total > 0))
const hasCombinedCosts = computed(() => combinedCostRows.value.some((row) => row.total > 0))

const categoryComparisonRows = computed(() => {
  if (!tender.value) {
    return []
  }

  return buildSectionVendorComparisonRows(
    tender.value.vendors,
    tender.value.sections,
    tender.value.settings.scoreRange
  )
})

const reportChartWidth = '700px'
const reportPrimaryColor = computed(() => tender.value?.settings.chartPalette[0]?.fillColor || '#0D57A6')

const reportChapters = [
  {
    number: '1',
    id: 'chapter-management-summary',
    title: 'Management Summary',
    description: 'Dieses Kapitel fasst die Entscheidungslage zusammen. Es zeigt, welche Anbieter nach aktuellem Bewertungsstand vorne liegen und ob die Entscheidung primär durch Qualität, Kosten oder eine ausgewogene Kombination beider Dimensionen geprägt ist.'
  },
  {
    number: '2',
    id: 'chapter-methodik',
    title: 'Methodik der Bewertung',
    description: 'Dieses Kapitel erklärt die Struktur der Ausschreibung. Es ordnet Anbieter, Kriterienkatalog und Kostenarten ein, damit die folgenden Bewertungen nachvollziehbar gelesen werden können.'
  },
  {
    number: '3',
    id: 'chapter-gesamtvergleich',
    title: 'Gesamtvergleich der Anbieter',
    description: 'Dieses Kapitel ordnet alle Anbieter gesamthaft ein. Es macht sichtbar, ob ein Anbieter nur wegen niedriger Kosten attraktiv wirkt, ob hohe Qualität höhere Kosten rechtfertigt oder ob ein Anbieter in beiden Dimensionen überzeugt.'
  },
  {
    number: '4',
    id: 'chapter-fachliche-bewertung',
    title: 'Fachliche Bewertung',
    description: 'Dieses Kapitel zeigt die inhaltliche Leistungsfähigkeit der Anbieter. Für eine Managemententscheidung ist hier relevant, welcher Anbieter die fachlichen Anforderungen am besten erfüllt und in welchen Kriterienblöcken deutliche Stärken oder Schwächen bestehen.'
  },
  {
    number: '5',
    id: 'chapter-kostenbewertung',
    title: 'Kostenbewertung',
    description: 'Dieses Kapitel betrachtet die wirtschaftliche Perspektive über den definierten Zeitraum. Es trennt einmalige Projektkosten von laufenden Run-Kosten und macht sichtbar, wodurch Kostenunterschiede zwischen den Anbietern entstehen.'
  },
  {
    number: '6',
    id: 'chapter-anhang',
    title: 'Anhang',
    description: 'Dieses Kapitel enthält Detailauswertungen zur Nachvollziehbarkeit. Die Inhalte unterstützen die Prüfung einzelner Bewertungsbereiche, ohne die Management Summary mit Detailtiefe zu überladen.'
  }
]

const isReadyForPdf = computed(() => status.value !== 'pending' && !error.value && Boolean(tender.value))

watch(isReadyForPdf, async (ready) => {
  if (!import.meta.client || !ready) {
    return
  }

  await nextTick()
  window.setTimeout(() => {
    window.__VISULOX_REPORT_READY__ = true
  }, 1200)
}, { immediate: true })

useSeoMeta({
  title: () => {
    const tenderName = tender.value?.name || 'Ausschreibung'
    return `${tenderName} - Report`
  }
})
</script>

<template>
  <main
    class="report-page bg-white text-gray-950"
    :style="{ '--report-primary-color': reportPrimaryColor }"
  >
    <section class="report-cover">
      <img
        src="/vkb-logo.svg"
        alt="VKB Logo"
        class="report-cover-logo"
      >

      <div class="report-cover-panel">
        <p class="report-kicker">
          Ausschreibungsbewertung
        </p>
        <h1>{{ tender?.name || 'Ausschreibung' }}</h1>
      </div>
    </section>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Ausschreibungsdetails konnten nicht geladen werden."
    />

    <div
      v-else-if="status === 'pending'"
      class="flex h-96 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
    >
      Lade Report ...
    </div>

    <div v-else-if="tender" class="report-content">
      <section class="report-toc">
        <p class="report-kicker">
          Inhaltsverzeichnis
        </p>
        <h2></h2>
        <ol>
          <li
            v-for="chapter in reportChapters"
            :key="chapter.number"
          >
            <a :href="`#${chapter.id}`">
              <span class="toc-number">{{ chapter.number }}</span>
              <span class="toc-title">{{ chapter.title }}</span>
            </a>
          </li>
        </ol>
      </section>

      <section :id="reportChapters[0].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[0]" />
        <ReportManagementSummary
          :rows="valueScoreRows"
          :consideration-years="tender.settings.considerationYears"
        />
      </section>

      <section :id="reportChapters[1].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[1]" />
        <ReportMethodology
          :vendors="tender.vendors"
          :sections="tender.sections"
          :cost-blocks="tender.costBlocks"
          :score-range="tender.settings.scoreRange"
          :consideration-years="tender.settings.considerationYears"
        />
      </section>

      <section :id="reportChapters[2].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[2]" />
        <div class="report-section-content">
          <ReportValueScoreComparison
            :rows="valueScoreRows"
            :consideration-years="tender.settings.considerationYears"
          />

          <ReportChartBlock
            title="Nutzen-Kosten-Positionierung"
            description="Die Positionierung zeigt, welche Anbieter bei fachlichem Nutzen und normierten Kosten gleichzeitig stark abschneiden. Oben rechts liegen Anbieter mit hohem Nutzen und relativ niedrigen Kosten. Die Größe der Bubbles entspricht dem Balanced Score: größere Bubbles stehen für eine stärkere kombinierte Bewertung aus Nutzen und Kosten."
          >
            <TenderValueScoreBubbleChart
              v-if="valueScoreChartHasData"
              :rows="valueScoreRows"
              :palette="tender.settings.chartPalette"
              renderer="svg"
              :width="reportChartWidth"
            />
            <p v-else class="report-empty-state">
              Für das Bubble Chart werden sowohl gewichtete Kriterienerfüllung als auch valide Gesamtkosten benötigt.
            </p>
          </ReportChartBlock>
        </div>
      </section>

      <section :id="reportChapters[3].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[3]" />
        <div class="report-section-content">
          <ReportChartBlock
            title="Gesamtbewertung der Kriterien"
            description="Das Diagramm zeigt die gewichtete fachliche Erfüllung je Anbieter. Die gestapelten Balken machen sichtbar, welche Kriterienblöcke zum Gesamtergebnis beitragen."
          >
            <TenderOverviewChart
              v-if="hasAnyQuestions"
              :scores="vendorScores"
              :palette="tender.settings.chartPalette"
              renderer="svg"
              :width="reportChartWidth"
            />
            <p v-else class="report-empty-state">
              Es wurden noch keine Fragen importiert. Der Vergleich wird angezeigt, sobald Daten vorliegen.
            </p>
          </ReportChartBlock>

          <TenderCategoryComparisonTable
            :vendors="tender.vendors"
            :sections="tender.sections"
            :score-range="tender.settings.scoreRange"
          />
        </div>
      </section>

      <section :id="reportChapters[4].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[4]" />
        <div class="report-section-content">
          <ReportChartBlock
            title="Gesamtkosten"
            :description="`Gesamtvergleich aller Anbieter mit gestapelten Projekt- und Run-Kosten. Die Run-Kosten werden über ${tender.settings.considerationYears} Jahre betrachtet.`"
          >
            <TenderCostOverviewChart
              v-if="hasCombinedCosts"
              kind="combined"
              :rows="combinedCostRows"
              :palette="tender.settings.chartPalette"
              renderer="svg"
              :width="reportChartWidth"
            />
            <p v-else class="report-empty-state">
              Es wurden noch keine Gesamtkosten erfasst.
            </p>
          </ReportChartBlock>

          <ReportChartBlock
            title="Projektkosten"
            description="Einmalige Projekt- und Lizenzkosten im direkten Anbieter-Vergleich."
          >
            <TenderCostOverviewChart
              v-if="hasProjectCosts"
              kind="project"
              :rows="projectCostRows"
              :palette="tender.settings.chartPalette"
              renderer="svg"
              :width="reportChartWidth"
            />
            <p v-else class="report-empty-state">
              Es wurden noch keine Projektkosten erfasst.
            </p>
          </ReportChartBlock>

          <ReportChartBlock
            title="Run-Kosten"
            :description="`Laufende Kosten über ${tender.settings.considerationYears} Jahre im Anbieter-Vergleich.`"
          >
            <TenderCostOverviewChart
              v-if="hasRunCosts"
              kind="run"
              :rows="runCostRows"
              :palette="tender.settings.chartPalette"
              renderer="svg"
              :width="reportChartWidth"
            />
            <p v-else class="report-empty-state">
              Es wurden noch keine Run-Kosten erfasst.
            </p>
          </ReportChartBlock>
        </div>
      </section>

      <section :id="reportChapters[5].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[5]" />
        <div v-if="hasAnyQuestions" class="report-category-chart-grid">
          <ReportChartBlock
            v-for="row in categoryComparisonRows"
            :key="row.sectionId"
            :title="row.sectionName"
            :description="`Kategoriegewicht: ${Math.round(row.sectionWeight)}%. Der beste Anbieter in dieser Kategorie ist farblich hervorgehoben.`"
          >
            <TenderCategoryComparisonChart
              :row="row"
              :palette="tender.settings.chartPalette"
              renderer="svg"
              :width="reportChartWidth"
            />
          </ReportChartBlock>
        </div>
        <p v-else class="report-empty-state">
          Es wurden noch keine Fragen importiert. Die Kategorievergleiche erscheinen, sobald Daten vorliegen.
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
@page {
  size: A4;
  margin: 12mm;
}

@page :first {
  margin: 0;
}

.report-page {
  box-sizing: border-box;
  min-height: 100vh;
  overflow: visible;
}

.report-cover {
  background-image: url('/vkb_background.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  break-after: always;
  box-sizing: border-box;
  display: flex;
  min-height: 297mm;
  flex-direction: column;
  padding: 22mm 20mm;
  position: relative;
  width: 210mm;
}

.report-cover-logo {
  height: auto;
  left: 10mm;
  max-width: 48mm;
  position: absolute;
  top: 10mm;
}

.report-cover-panel {
  background: rgba(255, 255, 255, 0.94);
  box-sizing: border-box;
  margin-top: 62mm;
  min-height: 69mm;
  padding: 12mm 14mm;
  width: 156mm;
}

.report-kicker {
  color: #4b5563;
  font-size: 11pt;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.report-cover h1 {
  color: var(--report-primary-color);
  max-width: 128mm;
  font-size: 30pt;
  font-weight: 750;
  line-height: 1.1;
  margin: 0;
}

.report-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8mm;
  margin-top: 18mm;
}

.report-meta dt {
  color: #6b7280;
  font-size: 9pt;
}

.report-meta dd {
  margin: 0;
  font-size: 15pt;
  font-weight: 650;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.report-toc {
  break-after: always;
  box-sizing: border-box;
  min-height: 250mm;
  padding-top: 28mm;
}

.report-toc h2 {
  margin: 0 0 18mm;
  font-size: 24pt;
  font-weight: 750;
  line-height: 1.1;
}

.report-toc ol {
  display: flex;
  flex-direction: column;
  gap: 7mm;
  list-style: none;
  margin: 0;
  padding: 0;
}

.report-toc a {
  align-items: baseline;
  border-bottom: 1px solid #e5e7eb;
  color: inherit;
  display: grid;
  grid-template-columns: 14mm minmax(0, 1fr);
  padding-bottom: 4mm;
  text-decoration: none;
}

.toc-number {
  color: #6b7280;
  font-size: 13pt;
  font-weight: 650;
}

.toc-title {
  font-size: 15pt;
  font-weight: 650;
}

.report-section {
  break-before: page;
  break-inside: auto;
  padding-top: 0;
}

.report-content .report-section:first-child {
  break-before: auto;
}

.report-section-content {
  display: flex;
  flex-direction: column;
  gap: 8mm;
  max-width: 100%;
  overflow: hidden;
}

.report-category-chart-grid {
  display: flex;
  flex-direction: column;
  gap: 8mm;
  max-width: 100%;
  overflow: hidden;
}

.report-empty-state {
  align-items: center;
  background: #f9fafb;
  color: #6b7280;
  display: flex;
  font-size: 10pt;
  font-style: italic;
  justify-content: center;
  min-height: 48mm;
  text-align: center;
}

.report-page :deep(button),
.report-page :deep([role="tooltip"]) {
  display: none;
}

.report-page :deep(.rounded-lg.border),
.report-page :deep(.rounded-xl.border-2) {
  background: #f9fafb;
}

.report-page :deep(.text-primary),
.report-page :deep(.text-primary-600),
.report-page :deep(.text-primary-700) {
  color: var(--report-primary-color) !important;
}

@media print {
  :global(html),
  :global(body),
  :global(#__nuxt) {
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
  }

  .report-page {
    padding: 0;
  }

  .report-page :deep(.ui-card),
  .report-page :deep(.rounded-xl),
  .report-page :deep(.rounded-lg) {
    break-inside: auto;
  }

  .report-section {
    max-width: 186mm;
    overflow: hidden;
  }
}
</style>
