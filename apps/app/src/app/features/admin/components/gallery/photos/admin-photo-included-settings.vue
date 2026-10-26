<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { Photo } from '@/app/features/gallery/types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{ photo: Photo }>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: submitSave,
  onSuccess: handleSaveSuccess,
  onError: handleSaveError,
})

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitSave() {
  return apiFetch(`/api/photos/${props.photo.id}/`, {
    method: 'PATCH',
    body: { is_included: !props.photo.is_included },
  })
}

async function handleSaveSuccess() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] }),
    queryClient.invalidateQueries({ queryKey: ['galleries'] }),
  ])
  toast.add({ title: 'Liberação do original atualizada', color: 'success' })
}

function handleSaveError() {
  return toast.add({ title: 'Não foi possível atualizar a liberação.', color: 'error' })
}
</script>

<template>
  <UPopover>
    <UButton
      icon="i-lucide-gift"
      :aria-label="`Configurar original incluído de ${photo.name}`"
      :color="photo.is_included ? 'success' : 'neutral'"
      variant="soft"
      size="sm"
      class="rounded-full"
    />
    <template #content>
      <div class="w-72 space-y-4 p-4">
        <p class="text-sm font-medium text-highlighted">Original incluído</p>
        <p class="text-xs leading-relaxed text-muted">
          Permite baixar o JPEG original sem pagar. Essa foto deixa de ser oferecida para compra
          individual.
        </p>
        <USwitch
          :model-value="!!photo.is_included"
          label="Liberar esta foto gratuitamente"
          :disabled="save.isPending.value"
          @update:model-value="save.mutate()"
        />
      </div>
    </template>
  </UPopover>
</template>
