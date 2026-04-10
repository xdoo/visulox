// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/app.css'],
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/test-utils/module',
    'nuxt-echarts'
  ],
  echarts: {
    renderer: ['svg', 'canvas'],
    charts: ['BarChart', 'LineChart', 'PieChart', 'RadarChart'],
    components: ['DatasetComponent', 'GridComponent', 'TooltipComponent', 'LegendComponent', 'TitleComponent', 'VisualMapComponent'],
  },
  app: {
    head: {
      titleTemplate: '%s - Visulox',
      title: 'Visulox'
    }
  },
  runtimeConfig: {
    databaseUrl: 'postgresql://visulox:visulox@localhost:5432/visulox'
  },
  future: {
    compatibilityVersion: 4
  }
})
