<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import { downloadPhoto } from '../../utils/photo'
import type { Gallery, PublicPhoto } from '../../types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{ gallery: Gallery; photo: PublicPhoto }>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const confirming = ref(false)
const errorMessage = ref('')

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const claim = useMutation({
  mutationFn: submitClaim,
  onMutate: handleClaimMutate,
  onSuccess: handleClaimSuccess,
  onError: handleClaimError,
})
const download = useMutation({
  mutationFn: submitDownload,
  onError: handleDownloadError,
})

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitClaim() {
  return apiFetch(`/api/galleries/public/${encodeURIComponent(props.gallery.slug)}/included/`, {
    method: 'POST',
    headers: {
      'X-Gallery-Access-Code': sessionStorage.getItem(`gallery-access:${props.gallery.slug}`) ?? '',
    },
    body: { photo_id: props.photo.id },
  })
}

function handleClaimMutate() {
  errorMessage.value = ''
}

async function handleClaimSuccess() {
  await queryClient.invalidateQueries({ queryKey: ['galleries', 'slug'] })
  await queryClient.invalidateQueries({ queryKey: ['my-included-photos'] })
  confirming.value = false
  toast.add({
    title: 'Foto incluída liberada',
    description: 'Você já pode baixar o original.',
    color: 'success',
  })
}

function handleClaimError(error: {
  data?: {
    errors?: {
      detail: string
    }[]
  }
}) {
  errorMessage.value =
    error.data?.errors?.map((item) => item.detail).join(' ') ||
    'Não foi possível liberar esta foto.'
}

function submitDownload() {
  return downloadPhoto(props.gallery, props.photo, true)
}

function handleDownloadError() {
  return toast.add({
    title: 'Não foi possível baixar o original. Tente novamente.',
    color: 'error',
  })
}
</script>

<template>
  <div @click.stop @keydown.stop>
    <UButton
      v-if="photo.can_download_original"
      label="Baixar original"
      icon="i-lucide-download"
      color="neutral"
      size="sm"
      class="rounded-full"
      :loading="download.isPending.value"
      @click="download.mutate()"
    />
    <UPopover
      v-else-if="gallery.included_eligible && (gallery.included_remaining ?? 0) > 0"
      v-model:open="confirming"
    >
      <UButton
        label="Usar foto incluída"
        icon="i-lucide-gift"
        color="neutral"
        variant="soft"
        size="sm"
        class="rounded-full"
      />
      <template #content>
        <div class="w-72 space-y-4 p-4">
          <h3 class="text-sm font-medium text-highlighted">Incluir esta foto?</h3>
          <p class="text-xs leading-relaxed text-muted">
            Esta escolha usa 1 das {{ gallery.included_remaining }} fotos restantes e libera o JPEG
            original sem pagar. Depois de confirmar, não é possível trocar a foto.
          </p>
          <UAlert v-if="errorMessage" :title="errorMessage" color="error" variant="subtle" />
          <UButton
            label="Confirmar escolha"
            color="neutral"
            block
            :loading="claim.isPending.value"
            @click="claim.mutate()"
          />
        </div>
      </template>
    </UPopover>
  </div>
</template>
