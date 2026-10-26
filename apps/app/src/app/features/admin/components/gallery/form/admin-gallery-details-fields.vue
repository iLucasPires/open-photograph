<script setup lang="ts">
import type { GalleryEditorState } from '@/app/features/admin/types/gallery/form'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const state = defineModel<GalleryEditorState>({ required: true })
const emit = defineEmits<{ editSlug: [] }>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const { copy } = useClipboard()

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function notifySlugEdited() {
  emit('editSlug')
}

function copySlug() {
  copy(state.value.slug)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField name="name" label="Nome da galeria" required>
        <UInput v-model="state.name" placeholder="Ensaio da família" class="w-full" />
      </UFormField>

      <UFormField name="slug" label="Endereço" required>
        <UFieldGroup class="w-full">
          <UInput v-model="state.slug" class="w-full" @update:model-value="notifySlugEdited" />
          <UTooltip text="Copiar endereço">
            <UButton
              icon="i-lucide-copy"
              aria-label="Copiar endereço"
              color="neutral"
              variant="subtle"
              @click="copySlug"
            />
          </UTooltip>
        </UFieldGroup>
      </UFormField>
    </div>

    <UFormField name="description" label="Descrição">
      <UTextarea v-model="state.description" class="w-full" :rows="3" />
    </UFormField>

    <UFormField name="tags" label="Tags">
      <CAdminGalleryTagsSelect v-model="state.tags" />
    </UFormField>

    <USeparator />

    <UFormField
      name="source_folder_id"
      label="Pasta de origem"
      description="Escolha a pasta de onde as fotos serão importadas."
    >
      <CAdminGalleryFolderSelect v-model="state.source_folder_id" />
    </UFormField>
  </div>
</template>
