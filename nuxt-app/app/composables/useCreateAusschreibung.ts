import { ref } from 'vue'

import type { NewTenderFormData } from '../types/new-tender'
import type { CreateAusschreibungRequest, CreateAusschreibungResponse } from '../../shared/types/ausschreibungen'

type CreateAusschreibungFetcher = <T>(request: string, options: {
  method: 'POST'
  body: CreateAusschreibungRequest
}) => Promise<T>

export function mapNewTenderToCreateAusschreibungRequest(tenderData: NewTenderFormData): CreateAusschreibungRequest {
  return {
    name: tenderData.name,
    sections: tenderData.criteria.map(({ name, weight }) => ({ name, weight })),
    priceCategories: tenderData.priceBlocks.map(({ name }) => ({ name })),
    vendors: tenderData.vendors.map(({ name }) => ({ name }))
  }
}

export function useCreateAusschreibung(fetcher: CreateAusschreibungFetcher = $fetch as CreateAusschreibungFetcher) {
  const isSaving = ref(false)
  const errorMessage = ref('')

  async function createAusschreibung(tenderData: NewTenderFormData) {
    isSaving.value = true
    errorMessage.value = ''

    try {
      const payload = mapNewTenderToCreateAusschreibungRequest(tenderData)

      return await fetcher<CreateAusschreibungResponse>('/api/ausschreibungen', {
        method: 'POST',
        body: payload
      })
    } catch {
      errorMessage.value = 'Ausschreibung konnte nicht gespeichert werden.'
      throw new Error(errorMessage.value)
    } finally {
      isSaving.value = false
    }
  }

  function clearError() {
    errorMessage.value = ''
  }

  return {
    isSaving,
    errorMessage,
    createAusschreibung,
    clearError
  }
}
