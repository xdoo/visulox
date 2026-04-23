<script setup lang="ts">
defineProps<{
  number: string
  title: string
  description: string
}>()
</script>

<template>
  <header class="report-chapter-header">
    <p>Kapitel {{ number }}</p>
    <h2>{{ title }}</h2>
    <div class="chapter-intent">
      {{ description }}
    </div>
  </header>
</template>

<style scoped>
.report-chapter-header {
  margin-bottom: 8mm;
}

.report-chapter-header p {
  color: #6b7280;
  font-size: 10pt;
  font-weight: 650;
  letter-spacing: 0.14em;
  margin: 0 0 3mm;
  text-transform: uppercase;
}

.report-chapter-header h2 {
  font-size: 24pt;
  font-weight: 750;
  line-height: 1.1;
  margin: 0 0 5mm;
}

.chapter-intent {
  background: #f3f4f6;
  border-left: 4px solid #0d57a6;
  color: #374151;
  font-size: 11pt;
  line-height: 1.55;
  padding: 5mm 6mm;
}
</style>
