<script setup lang="ts">
import { renderReportMarkdown } from '../../utils/reportMarkdown'

const props = defineProps<{
  markdown: string
}>()

const renderedMarkdown = computed(() => renderReportMarkdown(props.markdown))
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="report-markdown" v-html="renderedMarkdown" />
</template>

<style scoped>
.report-markdown {
  color: #374151;
  display: flex;
  flex-direction: column;
  gap: 3.5mm;
  font-size: 10.5pt;
  line-height: 1.55;
}

.report-markdown :deep(h2),
.report-markdown :deep(h3),
.report-markdown :deep(h4) {
  break-after: avoid-page;
  page-break-after: avoid;
  color: #111827;
  font-weight: 750;
  line-height: 1.2;
  margin: 0;
}

.report-markdown :deep(h2 + p),
.report-markdown :deep(h2 + ul),
.report-markdown :deep(h2 + ol),
.report-markdown :deep(h2 + table),
.report-markdown :deep(h2 + div),
.report-markdown :deep(h3 + p),
.report-markdown :deep(h3 + ul),
.report-markdown :deep(h3 + ol),
.report-markdown :deep(h3 + table),
.report-markdown :deep(h3 + div),
.report-markdown :deep(h4 + p),
.report-markdown :deep(h4 + ul),
.report-markdown :deep(h4 + ol),
.report-markdown :deep(h4 + table),
.report-markdown :deep(h4 + div) {
  break-before: avoid-page;
  page-break-before: avoid;
}

.report-markdown :deep(h2) {
  font-size: 17pt;
}

.report-markdown :deep(h3) {
  font-size: 14pt;
}

.report-markdown :deep(h4) {
  font-size: 12pt;
}

.report-markdown :deep(p) {
  margin: 0;
}

.report-markdown :deep(ul) {
  list-style-type: disc;
  list-style-position: outside;
  margin: 0;
  padding-left: 6mm;
}

.report-markdown :deep(ol) {
  list-style-type: decimal;
  list-style-position: outside;
  margin: 0;
  padding-left: 6mm;
}

.report-markdown :deep(li) {
  margin: 0 0 1.5mm;
}

.report-markdown :deep(li p) {
  margin: 0 0 1mm;
}

.report-markdown :deep(li p:last-child) {
  margin-bottom: 0;
}

.report-markdown :deep(strong) {
  color: #111827;
  font-weight: 700;
}

.report-markdown :deep(img) {
  break-inside: avoid;
  display: block;
  height: auto;
  max-width: 100%;
}
</style>
