import { useTenderSettingsMutation } from './useTenderSettingsMutation'

interface VendorPayload {
  name: string
}

type PostVendorFetcher = <T>(request: string, options: {
  method: 'POST'
  body: VendorPayload
}) => Promise<T>

type PatchVendorFetcher = <T>(request: string, options: {
  method: 'PATCH'
  body: VendorPayload
}) => Promise<T>

type DeleteVendorFetcher = <T>(request: string, options: {
  method: 'DELETE'
}) => Promise<T>

export function useTenderVendorMutations(tenderId: string) {
  const postVendorFetcher = $fetch as PostVendorFetcher
  const patchVendorFetcher = $fetch as PatchVendorFetcher
  const deleteVendorFetcher = $fetch as DeleteVendorFetcher
  const { errorMessage, runMutation, clearError } = useTenderSettingsMutation(tenderId)

  async function addVendor(payload: VendorPayload) {
    return await runMutation(() => postVendorFetcher(`/api/tenders/${tenderId}/vendors`, {
      method: 'POST',
      body: payload
    }))
  }

  async function updateVendor(vendorId: string, payload: VendorPayload) {
    return await runMutation(() => patchVendorFetcher(`/api/vendors/${vendorId}`, {
      method: 'PATCH',
      body: payload
    }))
  }

  async function deleteVendor(vendorId: string) {
    return await runMutation(() => deleteVendorFetcher(`/api/vendors/${vendorId}`, {
      method: 'DELETE'
    }))
  }

  return {
    errorMessage,
    addVendor,
    updateVendor,
    deleteVendor,
    clearError
  }
}
