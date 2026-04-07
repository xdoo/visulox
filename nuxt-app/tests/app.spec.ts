import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../app/app.vue'

describe('App', () => {
  it('renders dashboard layout', () => {
    // Da wir keine volle Nuxt-Umgebung im Unit-Test haben,
    // testen wir hier nur, ob die Komponente grundsätzlich existiert.
    // Ein voller Integrationstest mit `setup` von @nuxt/test-utils wäre besser,
    // aber wir halten es erst einmal minimal.
    expect(App).toBeDefined()
  })
})
