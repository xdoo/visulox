<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'

const open = defineModel<boolean>('open', { required: true })
const assessmentText = defineModel<string>('assessmentText', { required: true })

const props = defineProps<{
  catalogName: string
  isSaving: boolean
  canSave: boolean
  errorMessage: string
}>()

defineEmits<{
  submit: []
}>()

const toolbarItems: EditorToolbarItem[][] = [
  [
    {
      icon: 'i-lucide-heading',
      tooltip: { text: 'Überschriften' },
      content: { align: 'start' },
      items: [
        { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Überschrift 2' },
        { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Überschrift 3' },
        { kind: 'paragraph', icon: 'i-lucide-type', label: 'Absatz' }
      ]
    }
  ],
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Fett' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Kursiv' } }
  ],
  [
    { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: 'Aufzählung' } },
    { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: 'Nummerierte Liste' } }
  ]
]
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Bewertungstext: ${props.catalogName || 'Kriterienkatalog'}`"
    description="Pflegen Sie den Bewertungstext dieses Kriterienkatalogs."
    :ui="{ content: 'sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="props.errorMessage"
          color="error"
          variant="subtle"
          :description="props.errorMessage"
          icon="i-lucide-circle-alert"
        />

        <UFormField label="Bewertungstext">
          <UEditor
            v-slot="{ editor }"
            v-model="assessmentText"
            content-type="markdown"
            class="min-h-56 w-full"
            placeholder="Bewertungstext einfügen"
            :disabled="props.isSaving"
          >
            <UEditorToolbar :editor="editor" :items="toolbarItems" layout="bubble" />
          </UEditor>
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="props.isSaving"
          @click="open = false"
        >
          Abbrechen
        </UButton>
        <UButton
          icon="i-lucide-save"
          :loading="props.isSaving"
          :disabled="!props.canSave"
          @click="$emit('submit')"
        >
          Speichern
        </UButton>
      </div>
    </template>
  </UModal>
</template>
