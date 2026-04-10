import { reactive, ref } from 'vue'

type EditableSettingsModalMode = 'create' | 'edit'

interface UseEditableSettingsModalOptions<TItem, TForm extends object> {
  createForm: () => TForm
  assignForm: (form: TForm, item?: TItem) => void
  clearError: () => void
}

export function useEditableSettingsModal<TItem extends { id: string }, TForm extends object>(
  options: UseEditableSettingsModalOptions<TItem, TForm>
) {
  const isModalOpen = ref(false)
  const modalMode = ref<EditableSettingsModalMode>('create')
  const selectedItemId = ref('')
  const pendingAction = ref('')
  const form = reactive<TForm>(options.createForm())

  function openCreateModal() {
    modalMode.value = 'create'
    selectedItemId.value = ''
    options.assignForm(form)
    options.clearError()
    isModalOpen.value = true
  }

  function openEditModal(item: TItem) {
    modalMode.value = 'edit'
    selectedItemId.value = item.id
    options.assignForm(form, item)
    options.clearError()
    isModalOpen.value = true
  }

  function startPending(actionKey: string) {
    pendingAction.value = actionKey
  }

  function stopPending() {
    pendingAction.value = ''
  }

  return {
    isModalOpen,
    modalMode,
    selectedItemId,
    pendingAction,
    form,
    openCreateModal,
    openEditModal,
    startPending,
    stopPending
  }
}
