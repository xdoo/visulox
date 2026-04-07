import { describe, expect, it, vi } from 'vitest'

import { mapNewTenderToCreateAusschreibungRequest, useCreateAusschreibung } from '../app/composables/useCreateAusschreibung'

describe('useCreateAusschreibung', () => {
  it('maps local tender state to the API payload shape', () => {
    const payload = mapNewTenderToCreateAusschreibungRequest({
      name: 'IT-Dienstleistungen 2026',
      criteria: [{ name: 'Qualitaet', weight: 60 }],
      priceBlocks: [{ name: 'Implementierung' }],
      vendors: [{ name: 'Beispiel GmbH' }]
    })

    expect(payload).toEqual({
      name: 'IT-Dienstleistungen 2026',
      sections: [{ name: 'Qualitaet', weight: 60 }],
      priceCategories: [{ name: 'Implementierung' }],
      vendors: [{ name: 'Beispiel GmbH' }]
    })
  })

  it('posts the payload and returns the created id', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: '123' })
    const { createAusschreibung, isSaving, errorMessage } = useCreateAusschreibung(fetcher)

    const response = await createAusschreibung({
      name: 'Rahmenvertrag',
      criteria: [{ name: 'Qualitaet', weight: 100 }],
      priceBlocks: [{ name: 'Lizenz' }],
      vendors: [{ name: 'Acme AG' }]
    })

    expect(fetcher).toHaveBeenCalledWith('/api/ausschreibungen', {
      method: 'POST',
      body: {
        name: 'Rahmenvertrag',
        sections: [{ name: 'Qualitaet', weight: 100 }],
        priceCategories: [{ name: 'Lizenz' }],
        vendors: [{ name: 'Acme AG' }]
      }
    })
    expect(response).toEqual({ id: '123' })
    expect(isSaving.value).toBe(false)
    expect(errorMessage.value).toBe('')
  })

  it('exposes a simple error message when saving fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'))
    const { createAusschreibung, isSaving, errorMessage } = useCreateAusschreibung(fetcher)

    await expect(createAusschreibung({
      name: 'Rahmenvertrag',
      criteria: [{ name: 'Qualitaet', weight: 100 }],
      priceBlocks: [{ name: 'Lizenz' }],
      vendors: [{ name: 'Acme AG' }]
    })).rejects.toThrow('Ausschreibung konnte nicht gespeichert werden.')

    expect(isSaving.value).toBe(false)
    expect(errorMessage.value).toBe('Ausschreibung konnte nicht gespeichert werden.')
  })
})
