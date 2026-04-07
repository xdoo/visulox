// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/app.css'],
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/test-utils/module'
  ],
  app: {
    head: {
      titleTemplate: '%s - Visulox',
      title: 'Visulox'
    }
  },
  future: {
    compatibilityVersion: 4
  }
})
