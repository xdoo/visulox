import { useTenderSettingsMutation } from './useTenderSettingsMutation'

import type { TenderSettings, UpdateTenderSettingsResponse } from '../../shared/types/tenders'

type PatchTenderSettingsFetcher = <T>(request: string, options: {
  method: 'PATCH'
  body: TenderSettings
}) => Promise<T>

export function useTenderGeneralSettingsMutations(tenderId: string) {
  const patchTenderSettingsFetcher = $fetch as PatchTenderSettingsFetcher
  const { errorMessage, runMutation, clearError } = useTenderSettingsMutation(tenderId)

  async function updateTenderSettings(settings: TenderSettings) {
    return await runMutation(() => patchTenderSettingsFetcher<UpdateTenderSettingsResponse>(`/api/tenders/${tenderId}/settings`, {
      method: 'PATCH',
      body: settings
    }))
  }

  return {
    errorMessage,
    updateTenderSettings,
    clearError
  }
}
