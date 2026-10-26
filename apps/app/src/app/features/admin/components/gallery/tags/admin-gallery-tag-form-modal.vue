<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import type { GalleryTag } from '@/app/features/gallery/types'
import { galleryTagPayload } from './gallery-tag.payload'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{ tag?: GalleryTag; tags: GalleryTag[]; open?: boolean }>()
const emit = defineEmits<{
  close: [saved: boolean]
  'update:open': [value: boolean]
  'after:leave': []
}>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const formId = useId()
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const title = ref('')
const errorMessage = ref('')

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(
  [() => props.open, () => props.tag],
  () => {
    title.value = props.tag?.title ?? ''
    errorMessage.value = ''
  },
  { immediate: true },
)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: submitSave,
  onMutate: handleSaveMutate,
  onSuccess: handleSaveSuccess,
  onError: handleSaveError,
})

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitSave() {
  const body = galleryTagPayload(title.value, props.tags, props.tag?.id)
  return apiFetch<GalleryTag>(props.tag ? `/api/tags/${props.tag.id}/` : '/api/tags/', {
    method: props.tag ? 'PATCH' : 'POST',
    body,
  })
}

function handleSaveMutate() {
  errorMessage.value = ''
}

async function handleSaveSuccess() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['gallery-tags'] }),
    queryClient.invalidateQueries({ queryKey: ['galleries'] }),
  ])
  toast.add({ title: props.tag ? 'Tag atualizada' : 'Tag criada', color: 'success' })
  emit('close', true)
}

function handleSaveError(error: Error) {
  const response = error as {
    data?: {
      errors?: {
        detail: string
      }[]
    }
  }
  errorMessage.value =
    response.data?.errors?.map((item) => item.detail).join(' ') ||
    error.message ||
    'Não foi possível salvar a tag.'
}
</script>

<template>
  <UModal
    :open="open"
    :title="tag ? 'Editar tag' : 'Nova tag'"
    description="Organize suas galerias com um nome fácil de encontrar."
    :dismissible="!save.isPending.value"
    :close="{ disabled: save.isPending.value }"
    :ui="{ content: 'max-w-md', footer: 'justify-end' }"
    @update:open="emit('update:open', $event)"
    @after:leave="emit('after:leave')"
  >
    <template #body>
      <form :id="formId" class="space-y-5" @submit.prevent="save.mutate()">
        <UAlert v-if="errorMessage" :title="errorMessage" color="error" variant="subtle" />
        <UFormField label="Nome" required>
          <UInput
            v-model="title"
            placeholder="Nome da tag"
            :maxlength="100"
            required
            autofocus
            :disabled="save.isPending.value"
            class="w-full"
          />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        :disabled="save.isPending.value"
        @click="emit('close', false)"
      />
      <UButton
        :label="tag ? 'Salvar alterações' : 'Criar tag'"
        type="submit"
        :form="formId"
        color="neutral"
        :loading="save.isPending.value"
        :disabled="!title.trim() || save.isPending.value"
      />
    </template>
  </UModal>
</template>
