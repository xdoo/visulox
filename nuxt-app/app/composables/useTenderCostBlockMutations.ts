import type { TenderCostBlockType } from '../../shared/types/tenders'

import { useTenderSettingsMutation } from './useTenderSettingsMutation'

interface CostBlockPayload {
  name: string
  type: TenderCostBlockType
}

type PostFetcher = <T>(request: string, options: { method: 'POST', body: CostBlockPayload }) => Promise<T>
type PatchFetcher = <T>(request: string, options: { method: 'PATCH', body: CostBlockPayload }) => Promise<T>
type DeleteFetcher = <T>(request: string, options: { method: 'DELETE' }) => Promise<T>

export function useTenderCostBlockMutations(tenderId: string) {
  const postFetcher = $fetch as PostFetcher
  const patchFetcher = $fetch as PatchFetcher
  const deleteFetcher = $fetch as DeleteFetcher
  const { errorMessage, runMutation, clearError } = useTenderSettingsMutation(tenderId)

  async function addCostBlock(payload: CostBlockPayload) {
    return await runMutation(() => postFetcher(`/api/tenders/${tenderId}/cost-blocks`, {
      method: 'POST',
      body: payload
    }))
  }

  async function updateCostBlock(costBlockId: string, payload: CostBlockPayload) {
    return await runMutation(() => patchFetcher(`/api/cost-blocks/${costBlockId}`, {
      method: 'PATCH',
      body: payload
    }))
  }

  async function deleteCostBlock(costBlockId: string) {
    return await runMutation(() => deleteFetcher(`/api/cost-blocks/${costBlockId}`, {
      method: 'DELETE'
    }))
  }

  return {
    errorMessage,
    addCostBlock,
    updateCostBlock,
    deleteCostBlock,
    clearError
  }
}

