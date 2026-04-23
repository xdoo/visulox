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
      <section class="report-section">
        <TenderValueScoreBubbleCard
          :rows="valueScoreRows"
          :consideration-years="tender.settings.considerationYears"
          :palette="tender.settings.chartPalette"
        />
      </section>

      <section class="report-section">
        <TenderCostOverviewCard
          :vendors="tender.vendors"
          :cost-blocks="tender.costBlocks"
          :vendor-cost-items="tender.vendorCostItems"
          :consideration-years="tender.settings.considerationYears"
          :palette="tender.settings.chartPalette"
        />
      </section>

      <section class="report-section">
        <TenderOverviewCard
          :vendors="tender.vendors"
          :sections="tender.sections"
          :score-range="tender.settings.scoreRange"
          :palette="tender.settings.chartPalette"
        />
      </section>

      <section class="report-section">
        <TenderCategoryComparisonTable
          :vendors="tender.vendors"
          :sections="tender.sections"
          :score-range="tender.settings.scoreRange"
        />
      </section>

      <section class="report-section">
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
  min-height: 100vh;
  padding: 12mm;
}

.report-cover {
  break-after: page;
  display: flex;
  min-height: 260mm;
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
  gap: 8mm;
}

.report-section {
  break-inside: avoid;
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
  .report-page {
    padding: 0;
  }
}
</style>
