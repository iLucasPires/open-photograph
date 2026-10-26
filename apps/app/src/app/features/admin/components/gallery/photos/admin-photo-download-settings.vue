<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import type { Photo, PhotoDownloadPolicy } from '@/app/features/gallery/types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{
  photo: Photo
  galleryAllowsDownloads: boolean
}>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const options = [
  { label: 'Seguir a galeria', value: 'inherit', description: 'Usa a configuração geral.' },
  {
    label: 'Permitir nesta foto',
    value: 'allow',
    description: 'Libera mesmo se a galeria bloquear.',
  },
  {
    label: 'Bloquear nesta foto',
    value: 'deny',
    description: 'Bloqueia mesmo se a galeria permitir.',
  },
]

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const policy = computed(getPolicy)
const allowed = computed(getAllowed)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: submitSave,
  onSuccess: handleSaveSuccess,
  onError: handleSaveError,
})

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getPolicy() {
  return props.photo.download_policy
}

function getAllowed() {
  return policy.value === 'inherit' ? props.galleryAllowsDownloads : policy.value === 'allow'
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitSave(downloadPolicy: PhotoDownloadPolicy) {
  return apiFetch(`/api/photos/${props.photo.id}/`, {
    method: 'PATCH',
    body: { download_policy: downloadPolicy },
  })
}

async function handleSaveSuccess() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] }),
    queryClient.invalidateQueries({ queryKey: ['galleries', 'slug'] }),
  ])
}

function handleSaveError() {
  return toast.add({ title: 'Não foi possível alterar a permissão de download.', color: 'error' })
}
</script>

<template>
  <UTooltip :text="allowed ? 'Download da prévia permitido' : 'Download da prévia bloqueado'">
    <UPopover>
      <UButton
        :icon="allowed ? 'i-lucide-download' : 'i-lucide-lock-keyhole'"
        :aria-label="`Configurar download de ${photo.name}`"
        color="neutral"
        variant="ghost"
        size="sm"
        class="rounded-full bg-black/25 text-white backdrop-blur-md hover:bg-black/45"
        :loading="save.isPending.value"
      />
      <template #content>
        <div class="w-72 space-y-4 p-4">
          <div>
            <p class="text-sm font-medium">Download da prévia</p>
            <p class="mt-1 text-xs text-muted">
              A galeria {{ galleryAllowsDownloads ? 'permite' : 'bloqueia' }} downloads por padrão.
            </p>
          </div>
          <URadioGroup
            :model-value="policy"
            :items="options"
            value-key="value"
            :disabled="save.isPending.value"
            @update:model-value="save.mutate($event as PhotoDownloadPolicy)"
          />
          <p class="text-xs text-muted">Não altera a entrega de originais comprados.</p>
        </div>
      </template>
    </UPopover>
  </UTooltip>
</template>
