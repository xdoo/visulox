<script setup lang="ts">
import {
  calculateSectionContributionPercentage,
  calculateSectionFulfillmentPercentage
} from '../../../composables/useCriteriaSectionFulfillment'
import marketOverviewMarkdown from '../../../report-content/market-overview.md?raw'
import valueScoreResultsMarkdown from '../../../report-content/value-score-results.md?raw'
import costsOverallMarkdown from '../../../report-content/costs-overall.md?raw'
import costsProjectMarkdown from '../../../report-content/costs-project.md?raw'
import costsRunMarkdown from '../../../report-content/costs-run.md?raw'
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
const vendorCostBreakdowns = computed(() => {
  if (!tender.value) {
    return []
  }

  return tender.value.vendors.map((vendor) => ({
    vendorId: vendor.id,
    vendorName: vendor.name,
    projectAssessment: vendor.projectCostAssessment || '',
    runAssessment: vendor.runCostAssessment || '',
    projectRow: projectCostRows.value.find((row) => row.vendorId === vendor.id) || null,
    runRow: runCostRows.value.find((row) => row.vendorId === vendor.id) || null
  }))
})

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

const categoryComparisonSections = computed(() => {
  if (!tender.value) {
    return []
  }

  const sectionById = new Map(tender.value.sections.map(section => [section.id, section]))

  return categoryComparisonRows.value.map(row => ({
    row,
    section: sectionById.get(row.sectionId)
  }))
})

const reportChartWidth = '700px'
const reportPrimaryColor = computed(() => tender.value?.settings.chartPalette[0]?.fillColor || '#0D57A6')

const managementSummaryChapter = {
  number: '1',
  id: 'chapter-management-summary',
  title: 'Management Summary',
  description: 'Dieses Kapitel fasst die Entscheidungslage zusammen. Es zeigt, welche Anbieter nach aktuellem Bewertungsstand vorne liegen und ob die Entscheidung primär durch Qualität, Kosten oder eine ausgewogene Kombination beider Dimensionen geprägt ist.'
}
const marketOverviewChapter = {
  number: '2',
  id: 'chapter-market-overview',
  title: 'Allgemeine Marktbetrachtung',
  description: 'Dieses Kapitel ordnet die Ausschreibung in den relevanten Marktkontext ein. Es beschreibt allgemeine Rahmenbedingungen, die für die Bewertung und Einordnung der Anbieter relevant sind.'
}
const methodologyChapter = {
  number: '3',
  id: 'chapter-methodik',
  title: 'Methodik der Bewertung',
  description: 'Dieses Kapitel erklärt die Struktur der Ausschreibung. Es ordnet Anbieter, Kriterienkatalog und Kostenarten ein, damit die folgenden Bewertungen nachvollziehbar gelesen werden können.'
}
const valueComparisonChapter = {
  number: '4',
  id: 'chapter-gesamtvergleich',
  title: 'Gesamtvergleich der Anbieter',
  description: 'Dieses Kapitel ordnet alle Anbieter gesamthaft ein. Es macht sichtbar, ob ein Anbieter nur wegen niedriger Kosten attraktiv wirkt, ob hohe Qualität höhere Kosten rechtfertigt oder ob ein Anbieter in beiden Dimensionen überzeugt.'
}
const criteriaComparisonChapter = {
  number: '5',
  id: 'chapter-fachliche-bewertung',
  title: 'Fachliche Bewertung',
  description: 'Dieses Kapitel zeigt die inhaltliche Leistungsfähigkeit der Anbieter. Für eine Managemententscheidung ist hier relevant, welcher Anbieter die fachlichen Anforderungen am besten erfüllt und in welchen Kriterienblöcken deutliche Stärken oder Schwächen bestehen.'
}
const costComparisonChapter = {
  number: '6',
  id: 'chapter-kostenbewertung',
  title: 'Kostenbewertung',
  description: 'Dieses Kapitel betrachtet die wirtschaftliche Perspektive über den definierten Zeitraum. Es trennt einmalige Projektkosten von laufenden Run-Kosten und macht sichtbar, wodurch Kostenunterschiede zwischen den Anbietern entstehen.'
}

const reportChapters = [
  managementSummaryChapter,
  marketOverviewChapter,
  methodologyChapter,
  valueComparisonChapter,
  criteriaComparisonChapter,
  costComparisonChapter
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
        <h2 />
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

      <section :id="managementSummaryChapter.id" class="report-section">
        <ReportChapterHeader v-bind="managementSummaryChapter" />
        <ReportManagementSummary
          :rows="valueScoreRows"
          :consideration-years="tender.settings.considerationYears"
        />
      </section>

      <section :id="marketOverviewChapter.id" class="report-section">
        <ReportChapterHeader v-bind="marketOverviewChapter" />
        <div class="report-section-content">
          <ReportMarkdownBlock :markdown="marketOverviewMarkdown" />
        </div>
      </section>

      <section :id="methodologyChapter.id" class="report-section">
        <ReportChapterHeader v-bind="methodologyChapter" />
        <ReportMethodology
          :vendors="tender.vendors"
          :sections="tender.sections"
          :cost-blocks="tender.costBlocks"
          :score-range="tender.settings.scoreRange"
          :consideration-years="tender.settings.considerationYears"
        />
      </section>

      <section :id="valueComparisonChapter.id" class="report-section">
        <ReportChapterHeader v-bind="valueComparisonChapter" />
        <div class="report-section-content">
          <ReportValueScoreComparison
            :rows="valueScoreRows"
            :consideration-years="tender.settings.considerationYears"
          >
            <template #positioning>
              <ReportChartBlock
                title="Nutzen-Kosten-Positionierung"
                description="Die Positionierung ordnet die Anbieter nach fachlichem Nutzen und relativer Wirtschaftlichkeit ein. Anbieter im oberen rechten Bereich verbinden einen hohen fachlichen Nutzen mit einer starken Kostenposition. Die Bubble-Größe zeigt die kombinierte Gesamtbewertung."
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
            </template>

            <template #results-context>
              <div class="report-table-block">
                <h3>Einordnung der Ergebnisse</h3>
                <ReportMarkdownBlock :markdown="valueScoreResultsMarkdown" />
              </div>
            </template>
          </ReportValueScoreComparison>
        </div>
      </section>

      <section :id="criteriaComparisonChapter.id" class="report-section">
        <ReportChapterHeader v-bind="criteriaComparisonChapter" />
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

          <div v-if="hasAnyQuestions" class="report-category-sections">
            <section
              v-for="entry in categoryComparisonSections"
              :key="entry.row.sectionId"
              class="report-category-section"
            >
              <h3>{{ entry.row.sectionName }} (Gewicht {{ Math.round(entry.row.sectionWeight) }}%)</h3>
              <p class="report-category-description">
                {{ entry.section?.description || 'Für diese Kategorie wurde keine Beschreibung erfasst.' }}
              </p>

              <div class="report-category-chart">
                <TenderCategoryComparisonChart
                  :row="entry.row"
                  :palette="tender.settings.chartPalette"
                  renderer="svg"
                  :width="reportChartWidth"
                />
              </div>

              <p class="report-category-note">
                Das Diagramm vergleicht die fachliche Erfüllung dieser Kategorie über alle Anbieter. Der beste Anbieter in dieser Kategorie ist farblich hervorgehoben.
              </p>

              <div
                v-if="entry.section?.resultAssessment"
                class="report-category-result-assessment"
              >
                <h4>Einordnung der Kategorieergebnisse</h4>
                <ReportMarkdownBlock :markdown="entry.section.resultAssessment" />
              </div>
            </section>
          </div>
        </div>
      </section>

      <section :id="costComparisonChapter.id" class="report-section">
        <ReportChapterHeader v-bind="costComparisonChapter" />
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

            <ReportMarkdownBlock :markdown="costsOverallMarkdown" />
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

            <ReportMarkdownBlock :markdown="costsProjectMarkdown" />
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

            <ReportMarkdownBlock :markdown="costsRunMarkdown" />
          </ReportChartBlock>

          <div class="report-cost-vendor-sections">
            <section
              v-for="entry in vendorCostBreakdowns"
              :key="entry.vendorId"
              class="report-cost-vendor-section"
            >
              <ReportVendorCostBreakdown
                :vendor-name="entry.vendorName"
                :project-assessment="entry.projectAssessment"
                :run-assessment="entry.runAssessment"
                :project-row="entry.projectRow"
                :run-row="entry.runRow"
                :consideration-years="tender.settings.considerationYears"
                :palette="tender.settings.chartPalette"
                renderer="svg"
                :width="reportChartWidth"
              />
            </section>
          </div>
        </div>
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

.report-section :deep(h3) {
  color: #111827 !important;
  font-size: 1.17em !important;
  font-weight: 600 !important;
  line-height: normal !important;
  margin: 1em 0 !important;
}

.report-category-sections {
  display: flex;
  flex-direction: column;
  gap: 8mm;
  max-width: 100%;
  overflow: hidden;
}

.report-category-section {
  break-inside: avoid;
  display: flex;
  flex-direction: column;
  gap: 4mm;
}

.report-category-section h3 {
  color: #111827;
  font-size: 15pt;
  font-weight: 750;
  margin: 0;
}

.report-category-description {
  color: #374151;
  font-size: 10.5pt;
  line-height: 1.55;
  margin: 0;
  white-space: pre-line;
}

.report-category-result-assessment {
  color: #374151;
  display: flex;
  flex-direction: column;
  gap: 3mm;
}

.report-category-result-assessment h4 {
  color: #111827;
  font-size: 11pt;
  font-weight: 650;
  line-height: 1.25;
  margin: 0;
}

.report-category-chart {
  max-width: 100%;
  overflow: hidden;
}

.report-category-note {
  color: #6b7280;
  font-size: 9.5pt;
  line-height: 1.45;
  margin: 0;
}

.report-cost-vendor-sections {
  display: flex;
  flex-direction: column;
  gap: 8mm;
}

.report-cost-vendor-section {
  break-inside: auto;
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

.report-page :deep(h1),
.report-page :deep(h2),
.report-page :deep(h3),
.report-page :deep(h4),
.report-page :deep(h5),
.report-page :deep(h6) {
  break-after: avoid-page;
  page-break-after: avoid;
}

.report-page :deep(h1 + p),
.report-page :deep(h1 + ul),
.report-page :deep(h1 + ol),
.report-page :deep(h1 + table),
.report-page :deep(h1 + div),
.report-page :deep(h1 + section),
.report-page :deep(h2 + p),
.report-page :deep(h2 + ul),
.report-page :deep(h2 + ol),
.report-page :deep(h2 + table),
.report-page :deep(h2 + div),
.report-page :deep(h2 + section),
.report-page :deep(h3 + p),
.report-page :deep(h3 + ul),
.report-page :deep(h3 + ol),
.report-page :deep(h3 + table),
.report-page :deep(h3 + div),
.report-page :deep(h3 + section),
.report-page :deep(h4 + p),
.report-page :deep(h4 + ul),
.report-page :deep(h4 + ol),
.report-page :deep(h4 + table),
.report-page :deep(h4 + div),
.report-page :deep(h4 + section),
.report-page :deep(h5 + p),
.report-page :deep(h5 + ul),
.report-page :deep(h5 + ol),
.report-page :deep(h5 + table),
.report-page :deep(h5 + div),
.report-page :deep(h5 + section),
.report-page :deep(h6 + p),
.report-page :deep(h6 + ul),
.report-page :deep(h6 + ol),
.report-page :deep(h6 + table),
.report-page :deep(h6 + div),
.report-page :deep(h6 + section) {
  break-before: avoid-page;
  page-break-before: avoid;
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
