import { ref } from 'vue'

import { getTenderCriteriaCatalogPath } from './useTenderPaths'
import { useTenders } from './useTenders'

import type {
  CloneCriteriaCatalogResponse,
  DeleteTenderResponse,
  UpdateCriteriaCatalogResponse,
  UpdateTenderResponse
} from '../../shared/types/tenders'

type PatchTenderFetcher = <T>(request: string, options: {
  method: 'PATCH'
  body: { name: string }
}) => Promise<T>

type PostFetcher = <T>(request: string, options: {
  method: 'POST'
  body: Record<string, unknown>
}) => Promise<T>

type DeleteTenderFetcher = <T>(request: string, options: {
  method: 'DELETE'
}) => Promise<T>

export function useTenderGeneralActions(tenderId: string) {
  const patchFetcher = $fetch as PatchTenderFetcher
  const postFetcher = $fetch as PostFetcher
  const deleteFetcher = $fetch as DeleteTenderFetcher
  const { loadTenders, updateTender, removeTender } = useTenders()
  const errorMessage = ref('')
  const isSaving = ref(false)

  async function runAction<T>(action: () => Promise<T>) {
    errorMessage.value = ''
    isSaving.value = true

    try {
      return await action()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Änderung konnte nicht gespeichert werden.'
      return null
    } finally {
      isSaving.value = false
    }
  }

  async function renameTender(name: string) {
    const response = await runAction(() => patchFetcher<UpdateTenderResponse>(`/api/tenders/${tenderId}`, {
      method: 'PATCH',
      body: { name }
    }))

    if (!response) {
      return null
    }

    updateTender(response.tender)
    await refreshNuxtData(`tender-detail:${tenderId}`)

    return response.tender
  }

  async function cloneCriteriaCatalog(name: string, sourceCatalogId?: string) {
    const response = await runAction(() => postFetcher<CloneCriteriaCatalogResponse>(`/api/tenders/${tenderId}/criteria-catalogs/clone`, {
      method: 'POST',
      body: {
        name,
        sourceCatalogId
      }
    }))

    if (!response) {
      return null
    }

    await loadTenders()
    await refreshNuxtData(`tender-detail:${tenderId}`)
    await navigateTo(getTenderCriteriaCatalogPath(tenderId, response.catalog.id))

    return response.catalog
  }

  async function renameCriteriaCatalog(catalogId: string, name: string) {
    const response = await runAction(() => patchFetcher<UpdateCriteriaCatalogResponse>(`/api/tenders/${tenderId}/criteria-catalogs/${catalogId}`, {
      method: 'PATCH',
      body: { name }
    }))

    if (!response) {
      return null
    }

    await loadTenders()
    await refreshNuxtData(`tender-detail:${tenderId}:default`)
    await refreshNuxtData(`tender-detail:${tenderId}:${catalogId}`)

    return response.catalog
  }

  async function deleteTender() {
    const response = await runAction(() => deleteFetcher<DeleteTenderResponse>(`/api/tenders/${tenderId}`, {
      method: 'DELETE'
    }))

    if (!response) {
      return null
    }

    removeTender(response.tender.id)
    await navigateTo('/')

    return response.tender
  }

  function clearError() {
    errorMessage.value = ''
  }

  return {
    errorMessage,
    isSaving,
    renameTender,
    cloneCriteriaCatalog,
    renameCriteriaCatalog,
    deleteTender,
    clearError
  }
}
