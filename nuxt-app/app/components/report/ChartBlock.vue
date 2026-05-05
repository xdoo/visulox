<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="report-chart-block">
    <header>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </header>

    <div class="report-chart-content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.report-chart-block {
  break-inside: auto;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  width: 100%;
}

.report-chart-block header {
  break-after: avoid-page;
  page-break-after: avoid;
  margin-bottom: 4mm;
}

.report-chart-block h3 {
  color: #111827;
  font-size: 15pt;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 2mm;
}

.report-chart-block p {
  color: #4b5563;
  font-size: 10pt;
  line-height: 1.45;
  margin: 0;
}

.report-chart-content {
  background: #ffffff;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  width: 100%;
}

.report-chart-content > :first-child {
  break-inside: avoid-page;
  page-break-inside: avoid;
}

.report-chart-content :deep(.echarts),
.report-chart-content :deep(.vue-echarts),
.report-chart-content :deep(canvas),
.report-chart-content :deep(svg) {
  break-inside: avoid-page;
  page-break-inside: avoid;
  max-width: 100% !important;
}

@media print {
  .report-chart-block,
  .report-chart-content {
    width: 186mm;
  }

  .report-chart-content :deep(.echarts),
  .report-chart-content :deep(.vue-echarts),
  .report-chart-content :deep(canvas),
  .report-chart-content :deep(svg) {
    width: 186mm !important;
  }
}
</style>
