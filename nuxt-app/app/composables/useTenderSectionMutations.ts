import { useTenderSettingsMutation } from './useTenderSettingsMutation'

interface SectionPayload {
  name: string
  weight: number
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

export function useTenderSectionMutations(tenderId: string) {
  const postSectionFetcher = $fetch as PostSectionFetcher
  const patchSectionFetcher = $fetch as PatchSectionFetcher
  const deleteSectionFetcher = $fetch as DeleteSectionFetcher
  const { errorMessage, runMutation, clearError } = useTenderSettingsMutation(tenderId)

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

  return {
    errorMessage,
    addSection,
    updateSection,
    deleteSection,
    clearError
  }
}
