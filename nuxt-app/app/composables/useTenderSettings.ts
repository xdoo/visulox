import { ref } from 'vue'

interface SectionPayload {
  name: string
  weight: number
}

interface VendorPayload {
  name: string
}

type PostSectionFetcher = <T>(request: string, options: {
  method: 'POST'
  body: SectionPayload
}) => Promise<T>

type PatchSectionFetcher = <T>(request: string, options: {
  method: 'PATCH'
  body: SectionPayload
}) => Promise<T>

type DeleteSectionFetcher = <T>(request: string, options: {
  method: 'DELETE'
}) => Promise<T>

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

export function useTenderSettings(tenderId: string) {
  const errorMessage = ref('')
  const postSectionFetcher = $fetch as PostSectionFetcher
  const patchSectionFetcher = $fetch as PatchSectionFetcher
  const deleteSectionFetcher = $fetch as DeleteSectionFetcher
  const postVendorFetcher = $fetch as PostVendorFetcher
  const patchVendorFetcher = $fetch as PatchVendorFetcher
  const deleteVendorFetcher = $fetch as DeleteVendorFetcher

  async function refreshTenderDetail() {
    await refreshNuxtData(`tender-detail:${tenderId}`)
  }

  async function runMutation<T>(action: () => Promise<T>) {
    errorMessage.value = ''

    try {
      const result = await action()
      await refreshTenderDetail()
      return result
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Änderung konnte nicht gespeichert werden.'
      throw error
    }
  }

  async function addSection(payload: SectionPayload) {
    return await runMutation(() => postSectionFetcher(`/api/tenders/${tenderId}/sections`, {
      method: 'POST',
      body: payload
    }))
  }

  async function updateSection(sectionId: string, payload: SectionPayload) {
    return await runMutation(() => patchSectionFetcher(`/api/sections/${sectionId}`, {
      method: 'PATCH',
      body: payload
    }))
  }

  async function deleteSection(sectionId: string) {
    return await runMutation(() => deleteSectionFetcher(`/api/sections/${sectionId}`, {
      method: 'DELETE'
    }))
  }

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

  function clearError() {
    errorMessage.value = ''
  }

  return {
    errorMessage,
    addSection,
    updateSection,
    deleteSection,
    addVendor,
    updateVendor,
    deleteVendor,
    clearError
  }
}
