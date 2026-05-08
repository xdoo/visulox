<script setup lang="ts">
const route = useRoute()
const tenderId = computed(() => String(route.params.id || ''))
const catalogId = computed(() => String(route.params.catalogId || ''))
const { data: tender, status, error } = await useTenderDetail(tenderId, catalogId)

const activeCatalogName = computed(() => {
  const catalogs = tender.value?.criteriaCatalogs || []
  return catalogs.find((catalog) => catalog.id === tender.value?.activeCriteriaCatalogId)?.name || 'Kriterienkatalog'
})
const activeCatalog = computed(() => {
  const catalogs = tender.value?.criteriaCatalogs || []
  return catalogs.find((catalog) => catalog.id === tender.value?.activeCriteriaCatalogId) || null
})
const {
  errorMessage: assessmentErrorMessage,
  isAssessmentModalOpen,
  selectedCatalog,
  assessmentText,
  isSavingAssessment,
  canSaveAssessment,
  openAssessmentEditor,
  saveAssessment
} = useCriteriaCatalogAssessmentEditor(tenderId)

useSeoMeta({
  title: () => {
    const tenderName = tender.value?.name || 'Ausschreibung'
    return `${tenderName} - ${activeCatalogName.value}`
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold tracking-tight">
          {{ activeCatalogName }}
        </h2>

        <UTooltip text="Bewertungstext bearbeiten">
          <UButton
            icon="i-lucide-image"
            color="neutral"
            variant="ghost"
            aria-label="Bewertungstext bearbeiten"
            :disabled="!activeCatalog"
            @click="activeCatalog && openAssessmentEditor(activeCatalog)"
          />
        </UTooltip>
      </div>
      <p class="ui-text-muted">
        Ausschreibung {{ tender?.name || tenderId }}.
      </p>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Ausschreibungsdetails konnten nicht geladen werden."
    />

    <div
      v-else-if="status === 'pending' && !tender"
      class="flex h-96 items-center justify-center rounded-xl border-2 border-dashed ui-border text-center italic text-gray-400"
    >
      Lade Anbieter und Kriterienkatalog ...
    </div>

    <TenderVendorTabs v-else :vendors="tender?.vendors || []">
      <template #overview>
        <div class="space-y-6">
          <TenderOverviewCard
            :vendors="tender?.vendors || []"
            :sections="tender?.sections || []"
            :score-range="tender?.settings.scoreRange || [0, 10]"
            :palette="tender?.settings.chartPalette"
          />

          <TenderCategoryComparisonOverview
            :tender-id="tender?.id || tenderId"
            :vendors="tender?.vendors || []"
            :sections="tender?.sections || []"
            :score-range="tender?.settings.scoreRange || [0, 10]"
            :palette="tender?.settings.chartPalette"
          />
        </div>
      </template>

      <template #vendor="{ vendor }">
        <div class="space-y-4">
          <TenderVendorCriteriaCard
            v-if="vendor"
            :vendor="vendor"
            :sections="tender?.sections || []"
            :score-range="tender?.settings.scoreRange || [0, 10]"
          />

          <TenderCriteriaSections
            :sections="tender?.sections || []"
            :vendor-id="vendor?.id || ''"
            :score-range="tender?.settings.scoreRange || [0, 10]"
          />
        </div>
      </template>
    </TenderVendorTabs>

    <TenderCriteriaCatalogAssessmentModal
      v-model:open="isAssessmentModalOpen"
      v-model:assessment-text="assessmentText"
      :catalog-name="selectedCatalog?.name || activeCatalogName"
      :is-saving="isSavingAssessment"
      :can-save="canSaveAssessment"
      :error-message="assessmentErrorMessage"
      @submit="saveAssessment"
    />
  </div>
</template>
