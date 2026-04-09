import { describe, expect, it, vi } from 'vitest'

import { mapTenderFormToCreateTenderRequest, useCreateTender } from '../app/composables/useCreateTender'

vi.mock('../app/composables/useTenders', () => ({
  useTenders: () => ({
    addTender: addTenderMock,
    getTenderPath: (id: string) => `/tenders/${id}`
  })
}))

const addTenderMock = vi.fn()
const navigateToMock = vi.fn()

vi.stubGlobal('navigateTo', navigateToMock)

describe('useCreateTender', () => {
  it('updates the ausschreibungen state after a successful save', async () => {
    navigateToMock.mockReset()
    const fetcher = vi.fn().mockResolvedValue({ id: '123' })
    const { createTender } = useCreateTender(fetcher)

    await createTender({
      name: 'Rahmenvertrag',
      criteria: [{ name: 'Qualitaet', weight: 100 }],
      priceBlocks: [{ name: 'Lizenz' }],
      vendors: [{ name: 'Acme AG' }]
    })

    expect(addTenderMock).toHaveBeenCalledWith({
      id: '123',
      name: 'Rahmenvertrag'
    })
    expect(navigateToMock).toHaveBeenCalledWith('/tenders/123')
  })

  it('maps local tender state to the API payload shape', () => {
    const payload = mapTenderFormToCreateTenderRequest({
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
    addTenderMock.mockReset()
    navigateToMock.mockReset()
    const fetcher = vi.fn().mockResolvedValue({ id: '123' })
    const { createTender, isSaving, errorMessage } = useCreateTender(fetcher)

    const response = await createTender({
      name: 'Rahmenvertrag',
      criteria: [{ name: 'Qualitaet', weight: 100 }],
      priceBlocks: [{ name: 'Lizenz' }],
      vendors: [{ name: 'Acme AG' }]
    })

    expect(fetcher).toHaveBeenCalledWith('/api/tenders', {
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
    addTenderMock.mockReset()
    navigateToMock.mockReset()
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'))
    const { createTender, isSaving, errorMessage } = useCreateTender(fetcher)

    await expect(createTender({
      name: 'Rahmenvertrag',
      criteria: [{ name: 'Qualitaet', weight: 100 }],
      priceBlocks: [{ name: 'Lizenz' }],
      vendors: [{ name: 'Acme AG' }]
    })).rejects.toThrow('Ausschreibung konnte nicht gespeichert werden.')

    expect(isSaving.value).toBe(false)
    expect(errorMessage.value).toBe('Ausschreibung konnte nicht gespeichert werden.')
    expect(addTenderMock).not.toHaveBeenCalled()
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})
