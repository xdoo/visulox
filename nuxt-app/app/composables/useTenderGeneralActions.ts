import { ref } from 'vue'

import { getTenderPath } from './useTenderPaths'
import { useTenders } from './useTenders'

import type {
  CloneTenderResponse,
  DeleteTenderResponse,
  UpdateTenderResponse
} from '../../shared/types/tenders'

type PatchTenderFetcher = <T>(request: string, options: {
  method: 'PATCH'
  body: { name: string }
}) => Promise<T>

type PostTenderFetcher = <T>(request: string, options: {
  method: 'POST'
  body: { name: string }
}) => Promise<T>

type DeleteTenderFetcher = <T>(request: string, options: {
  method: 'DELETE'
}) => Promise<T>

export function useTenderGeneralActions(tenderId: string) {
  const patchFetcher = $fetch as PatchTenderFetcher
  const postFetcher = $fetch as PostTenderFetcher
  const deleteFetcher = $fetch as DeleteTenderFetcher
  const { addTender, updateTender, removeTender } = useTenders()
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

  async function cloneTender(name: string) {
    const response = await runAction(() => postFetcher<CloneTenderResponse>(`/api/tenders/${tenderId}/clone`, {
      method: 'POST',
      body: { name }
    }))

    if (!response) {
      return null
    }

    addTender(response.tender)
    await navigateTo(getTenderPath(response.tender.id))

    return response.tender
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
    cloneTender,
    deleteTender,
    clearError
  }
}
