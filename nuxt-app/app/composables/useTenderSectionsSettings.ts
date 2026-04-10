import { computed, reactive, ref, toValue } from 'vue'

import { useTenderSettings } from './useTenderSettings'

import type { MaybeRefOrGetter } from 'vue'
import type { TenderSection } from '../../shared/types/tenders'

export interface SectionSettingsRow extends TenderSection {
  hasImportedQuestions: boolean
}

type SectionModalMode = 'create' | 'edit'

export function mapSectionsForSettings(sections: TenderSection[]): SectionSettingsRow[] {
  return sections.map((section) => ({
    ...section,
    hasImportedQuestions: section.questionsByVendor.some((entry) => entry.questions.length > 0)
  }))
}

export function parseSectionWeight(value: string) {
  const normalizedValue = Number(value)
  return Number.isInteger(normalizedValue) ? normalizedValue : null
}

interface NextWeightTotalOptions {
  currentTotal: number
  nextWeight: number
  mode: SectionModalMode
  selectedSectionWeight?: number
}

export function calculateNextSectionWeightTotal(options: NextWeightTotalOptions) {
  if (options.mode === 'create') {
    return options.currentTotal + options.nextWeight
  }

  if (options.selectedSectionWeight === undefined) {
    return options.currentTotal
  }

  return options.currentTotal - options.selectedSectionWeight + options.nextWeight
}

export function useTenderSectionsSettings(tenderId: string, sections: MaybeRefOrGetter<TenderSection[]>) {
  const toast = useToast()
  const isModalOpen = ref(false)
  const modalMode = ref<SectionModalMode>('create')
  const selectedSectionId = ref('')
  const pendingAction = ref('')
  const form = reactive({
    name: '',
    weight: ''
  })

  const {
    errorMessage,
    addSection,
    updateSection,
    deleteSection,
    clearError
  } = useTenderSettings(tenderId)

  const rows = computed<SectionSettingsRow[]>(() => mapSectionsForSettings(toValue(sections)))

  const totalWeight = computed(() => {
    return toValue(sections).reduce((sum, section) => sum + section.weight, 0)
  })

  const selectedSection = computed(() => {
    return rows.value.find((section) => section.id === selectedSectionId.value) || null
  })

  const modalLockReason = computed(() => {
    return selectedSection.value?.hasImportedQuestions
      ? 'Das Gewicht kann nicht geändert werden, weil für diesen Abschnitt bereits Fragen importiert wurden. Das Abschnittsgewicht gilt für die gesamte Ausschreibung.'
      : ''
  })

  const canSave = computed(() => {
    const parsedWeight = parseSectionWeight(form.weight)

    if (!form.name.trim() || parsedWeight === null) {
      return false
    }

    if (modalMode.value === 'create') {
      return true
    }

    if (!selectedSection.value) {
      return false
    }

    return form.name.trim() !== selectedSection.value.name || parsedWeight !== selectedSection.value.weight
  })

  function setForm(section?: TenderSection) {
    form.name = section?.name || ''
    form.weight = section ? String(section.weight) : ''
  }

  function openCreateModal() {
    modalMode.value = 'create'
    selectedSectionId.value = ''
    setForm()
    clearError()
    isModalOpen.value = true
  }

  function openEditModal(section: SectionSettingsRow) {
    modalMode.value = 'edit'
    selectedSectionId.value = section.id
    setForm(section)
    clearError()
    isModalOpen.value = true
  }

  function notifyIfWeightTotalIsInvalid(nextTotal: number) {
    if (nextTotal === 100) {
      return
    }

    toast.add({
      title: 'Gewichtssumme ungleich 100%',
      description: `Die Abschnitte wurden gespeichert. Die aktuelle Summe beträgt ${nextTotal}%.`,
      color: 'warning',
      icon: 'i-lucide-triangle-alert'
    })
  }

  async function handleSubmit() {
    const parsedWeight = parseSectionWeight(form.weight)

    if (!canSave.value || parsedWeight === null) {
      return
    }

    pendingAction.value = modalMode.value === 'create' ? 'create' : `save:${selectedSectionId.value}`
    clearError()

    try {
      const nextTotal = calculateNextSectionWeightTotal({
        currentTotal: totalWeight.value,
        nextWeight: parsedWeight,
        mode: modalMode.value,
        selectedSectionWeight: selectedSection.value?.weight
      })

      if (modalMode.value === 'create') {
        await addSection({
          name: form.name.trim(),
          weight: parsedWeight
        })
      } else if (selectedSection.value) {
        await updateSection(selectedSection.value.id, {
          name: form.name.trim(),
          weight: parsedWeight
        })
      }

      isModalOpen.value = false
      notifyIfWeightTotalIsInvalid(nextTotal)
    } finally {
      pendingAction.value = ''
    }
  }

  async function handleDelete(section: SectionSettingsRow) {
    pendingAction.value = `delete:${section.id}`
    clearError()

    try {
      await deleteSection(section.id)
      notifyIfWeightTotalIsInvalid(totalWeight.value - section.weight)
    } finally {
      pendingAction.value = ''
    }
  }

  return {
    errorMessage,
    rows,
    totalWeight,
    isModalOpen,
    modalMode,
    selectedSectionId,
    selectedSection,
    pendingAction,
    form,
    modalLockReason,
    canSave,
    openCreateModal,
    openEditModal,
    handleSubmit,
    handleDelete
  }
}
