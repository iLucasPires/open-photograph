<script setup lang="ts">
import type { GalleryTag } from '@/app/features/gallery/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import type { iApiPaginationNumber } from '@/app/shared/types'
import { galleryTagPayload } from './gallery-tag.payload'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const selectedTags = defineModel<string[]>({ required: true })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const tagsKey = ['gallery-tags']

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const searchTerm = ref('')
const errorMessage = ref('')

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: tags,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: tagsKey,
  queryFn: fetchTags,
})

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: submitSave,
  onMutate: handleSaveMutate,
  onSuccess,
  onError: handleSaveError,
})

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function onError(error: Error) {
  const response = error as { data?: { errors?: { detail: string }[] } }
  errorMessage.value =
    response.data?.errors?.map((item) => item.detail).join(' ') ||
    'Não foi possível salvar a alteração. Tente novamente.'
}

async function onSuccess() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: tagsKey }),
    queryClient.invalidateQueries({ queryKey: ['galleries'] }),
  ])
}

async function createTag(title: string) {
  try {
    const tag = await save.mutateAsync({ title })
    selectedTags.value = [...new Set([...selectedTags.value, tag.id])]
    searchTerm.value = ''
  } catch {
    // Mutation errors remain visible below the selector.
  }
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitSave({ id, title }: { id?: string; title: string }) {
  const body = galleryTagPayload(title, tags.value ?? [], id)
  return apiFetch<GalleryTag>(id ? `/api/tags/${id}/` : '/api/tags/', {
    method: id ? 'PATCH' : 'POST',
    body,
  })
}

function handleSaveMutate() {
  errorMessage.value = ''
}

function handleSaveError(error: Error) {
  onError(error)
  if (!('data' in error)) errorMessage.value = error.message
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

async function fetchTags() {
  const tags: GalleryTag[] = []
  let page = 1
  while (true) {
    const response = await apiFetch<iApiPaginationNumber<GalleryTag>>('/api/tags/', {
      query: { page, page_size: 1000 },
    })
    tags.push(...response.results)
    if (!response.next) return tags
    page += 1
  }
}
</script>

<template>
  <div class="space-y-2">
    <USelectMenu
      v-model="selectedTags"
      v-model:search-term="searchTerm"
      :items="tags ?? []"
      :loading="isPending || save.isPending.value"
      :disabled="isPending || isError || save.isPending.value"
      :create-item="searchTerm.trim().length > 0 && searchTerm.trim().length <= 100"
      :search-input="{ placeholder: 'Buscar ou criar tag...', maxlength: 100 }"
      label-key="title"
      value-key="id"
      placeholder="Selecione ou crie tags"
      :ui="{ content: 'z-[60]' }"
      multiple
      class="w-full"
      @create="createTag"
    >
      <template #create-item-label="{ item }">Criar tag “{{ item.trim() }}”</template>
    </USelectMenu>
    <UAlert
      v-if="isError"
      title="Não foi possível carregar as tags"
      color="error"
      variant="subtle"
      :actions="[{ label: 'Tentar novamente', onClick: () => refetch() }]"
    />
    <UAlert v-if="errorMessage" :title="errorMessage" color="error" variant="subtle" />
  </div>
</template>
