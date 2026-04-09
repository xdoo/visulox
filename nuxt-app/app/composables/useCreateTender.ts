import { ref } from 'vue'

import { useTenders } from './useTenders'

import type { TenderFormData } from '../types/tender-wizard'
import type { CreateTenderRequest, CreateTenderResponse } from '../../shared/types/tenders'

type CreateTenderFetcher = <T>(request: string, options: {
  method: 'POST'
  body: CreateTenderRequest
}) => Promise<T>

export function mapTenderFormToCreateTenderRequest(tenderData: TenderFormData): CreateTenderRequest {
  return {
    name: tenderData.name,
    sections: tenderData.criteria.map(({ name, weight }) => ({ name, weight })),
    priceCategories: tenderData.priceBlocks.map(({ name }) => ({ name })),
    vendors: tenderData.vendors.map(({ name }) => ({ name }))
  }
}

export function useCreateTender(fetcher: CreateTenderFetcher = $fetch as CreateTenderFetcher) {
  const isSaving = ref(false)
  const errorMessage = ref('')
  const { addTender, getTenderPath } = useTenders()

  async function createTender(tenderData: TenderFormData) {
    isSaving.value = true
    errorMessage.value = ''

    try {
      const payload = mapTenderFormToCreateTenderRequest(tenderData)

      const response = await fetcher<CreateTenderResponse>('/api/tenders', {
        method: 'POST',
        body: payload
      })

      addTender({
        id: response.id,
        name: payload.name
      })

      await navigateTo(getTenderPath(response.id))

      return response
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
    createTender,
    clearError
  }
}
