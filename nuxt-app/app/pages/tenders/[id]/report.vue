<script setup lang="ts">
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

const reportChapters = [
  {
    number: '1',
    id: 'chapter-management-summary',
    title: 'Management Summary',
    description: 'Dieses Kapitel fasst die Entscheidungslage zusammen. Es zeigt, welche Anbieter nach aktuellem Bewertungsstand vorne liegen und ob die Entscheidung primär durch Qualität, Kosten oder eine ausgewogene Kombination beider Dimensionen geprägt ist.'
  },
  {
    number: '2',
    id: 'chapter-gesamtvergleich',
    title: 'Gesamtvergleich der Anbieter',
    description: 'Dieses Kapitel ordnet alle Anbieter gesamthaft ein. Es macht sichtbar, ob ein Anbieter nur wegen niedriger Kosten attraktiv wirkt, ob hohe Qualität höhere Kosten rechtfertigt oder ob ein Anbieter in beiden Dimensionen überzeugt.'
  },
  {
    number: '3',
    id: 'chapter-fachliche-bewertung',
    title: 'Fachliche Bewertung',
    description: 'Dieses Kapitel zeigt die inhaltliche Leistungsfähigkeit der Anbieter. Für eine Managemententscheidung ist hier relevant, welcher Anbieter die fachlichen Anforderungen am besten erfüllt und in welchen Kriterienblöcken deutliche Stärken oder Schwächen bestehen.'
  },
  {
    number: '4',
    id: 'chapter-kostenbewertung',
    title: 'Kostenbewertung',
    description: 'Dieses Kapitel betrachtet die wirtschaftliche Perspektive über den definierten Zeitraum. Es trennt einmalige Projektkosten von laufenden Run-Kosten und macht sichtbar, wodurch Kostenunterschiede zwischen den Anbietern entstehen.'
  },
  {
    number: '5',
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
  <main class="report-page bg-white text-gray-950">
    <section class="report-cover">
      <p class="report-kicker">
        Ausschreibungsbewertung
      </p>
      <h1>{{ tender?.name || 'Ausschreibung' }}</h1>
      <dl v-if="tender" class="report-meta">
        <div>
          <dt>Anbieter</dt>
          <dd>{{ tender.vendors.length }}</dd>
        </div>
        <div>
          <dt>Bewertungsskala</dt>
          <dd>{{ tender.settings.scoreRange[0] }} bis {{ tender.settings.scoreRange[1] }}</dd>
        </div>
        <div>
          <dt>Kostenbetrachtung</dt>
          <dd>{{ tender.settings.considerationYears }} Jahre</dd>
        </div>
      </dl>
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
        <h2>Aufbau des Reports</h2>
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
        <TenderValueScoreTable
          :rows="valueScoreRows"
          :consideration-years="tender.settings.considerationYears"
        />
      </section>

      <section :id="reportChapters[1].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[1]" />
        <TenderValueScoreBubbleCard
          :rows="valueScoreRows"
          :consideration-years="tender.settings.considerationYears"
          :palette="tender.settings.chartPalette"
        />
      </section>

      <section :id="reportChapters[2].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[2]" />
        <div class="report-section-content">
          <TenderOverviewCard
            :vendors="tender.vendors"
            :sections="tender.sections"
            :score-range="tender.settings.scoreRange"
            :palette="tender.settings.chartPalette"
          />

          <TenderCategoryComparisonTable
            :vendors="tender.vendors"
            :sections="tender.sections"
            :score-range="tender.settings.scoreRange"
          />
        </div>
      </section>

      <section :id="reportChapters[3].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[3]" />
        <TenderCostOverviewCard
          :vendors="tender.vendors"
          :cost-blocks="tender.costBlocks"
          :vendor-cost-items="tender.vendorCostItems"
          :consideration-years="tender.settings.considerationYears"
          :palette="tender.settings.chartPalette"
        />
      </section>

      <section :id="reportChapters[4].id" class="report-section">
        <ReportChapterHeader v-bind="reportChapters[4]" />
        <TenderCategoryComparisonOverview
          :vendors="tender.vendors"
          :sections="tender.sections"
          :score-range="tender.settings.scoreRange"
          :palette="tender.settings.chartPalette"
        />
      </section>
    </div>
  </main>
</template>

<style scoped>
@page {
  size: A4;
  margin: 12mm;
}

.report-page {
  box-sizing: border-box;
  min-height: 100vh;
  overflow: visible;
}

.report-cover {
  break-after: always;
  box-sizing: border-box;
  display: flex;
  min-height: 250mm;
  flex-direction: column;
  justify-content: center;
}

.report-kicker {
  color: #4b5563;
  font-size: 11pt;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.report-cover h1 {
  max-width: 170mm;
  font-size: 30pt;
  font-weight: 750;
  line-height: 1.1;
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
}

.report-page :deep(button),
.report-page :deep([role="tooltip"]) {
  display: none;
}

.report-page :deep(.rounded-lg.border),
.report-page :deep(.rounded-xl.border-2) {
  background: #f9fafb;
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
}
</style>
