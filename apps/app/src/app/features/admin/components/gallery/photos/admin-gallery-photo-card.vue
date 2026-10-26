<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { Photo } from '@/app/features/gallery/types/photo'
import CAdminPhotoDownloadSettings from './admin-photo-download-settings.vue'
import CAdminGalleryPhotoPriceForm from './admin-gallery-photo-price-form.vue'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{
  photo: Photo
  allowIndividualPurchase?: boolean
  syncDisabled?: boolean
  syncing?: boolean
  galleryAllowsDownloads: boolean
  defaultPhotoPrice?: string | null
  galleryCurrency?: string
  includedPhotoMode?: string
}>()
const emit = defineEmits<{ sync: [photo: Photo] }>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const statusMap = {
  processing: { label: 'Processando', color: 'warning' },
  ready: { label: 'Pronta', color: 'success' },
  failed: { label: 'Falhou', color: 'error' },
} as const

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const visibility = useMutation({
  mutationFn: submitVisibility,
  onSuccess: handleVisibilitySuccess,
  onError: handleVisibilityError,
})

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitVisibility() {
  return apiFetch<Photo>(`/api/photos/${props.photo.id}/`, {
    method: 'PATCH',
    body: { is_active: !props.photo.is_active },
  })
}

async function handleVisibilitySuccess(photo: Photo) {
  toast.add({
    title: photo.is_active ? 'Foto reativada' : 'Foto desativada',
    description: photo.name,
    color: 'success',
  })
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] }),
    queryClient.invalidateQueries({ queryKey: ['galleries'] }),
  ])
}

function handleVisibilityError() {
  toast.add({ title: 'Não foi possível atualizar a foto', color: 'error' })
}
</script>

<template>
  <UCard
    :class="{ 'opacity-55 grayscale': !photo.is_active }"
    :ui="{
      root: 'group relative overflow-hidden rounded-2xl shadow-none ring-0 bg-elevated',
      body: 'relative aspect-2/3 p-0 sm:p-0',
    }"
  >
    <img
      v-if="photo.watermarked_preview || photo.thumbnail || photo.preview"
      :src="photo.watermarked_preview || photo.thumbnail || photo.preview || ''"
      :alt="photo.name"
      class="absolute inset-0 size-full object-cover"
      loading="lazy"
    />
    <div v-else class="absolute inset-0 flex items-center justify-center bg-elevated">
      <UIcon name="i-lucide-image" class="size-10 text-muted" />
    </div>

    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
    />
    <div class="absolute inset-x-3 bottom-3 flex items-center gap-2 text-white">
      <p class="min-w-0 flex-1 truncate text-xs font-medium" :title="photo.name">
        {{ photo.name }}
      </p>
      <UBadge
        :label="statusMap[photo.status].label"
        :color="statusMap[photo.status].color"
        variant="soft"
        size="sm"
      />
      <UBadge
        v-if="!photo.is_active"
        label="Desativada"
        color="neutral"
        variant="solid"
        size="sm"
      />
    </div>
    <div
      class="absolute right-3 top-3 flex gap-1 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:opacity-0 [@media(hover:none)]:opacity-100"
    >
      <UTooltip :text="photo.is_active ? 'Desativar foto' : 'Reativar foto'">
        <UButton
          :icon="photo.is_active ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="`${photo.is_active ? 'Desativar' : 'Reativar'} ${photo.name}`"
          color="neutral"
          variant="ghost"
          size="sm"
          class="rounded-full bg-black/25 text-white backdrop-blur-md hover:bg-black/45"
          :loading="visibility.isPending.value"
          @click="visibility.mutate()"
        />
      </UTooltip>
      <CAdminPhotoIncludedSettings v-if="includedPhotoMode === 'photographer'" :photo="photo" />
      <CAdminPhotoDownloadSettings
        :photo="photo"
        :gallery-allows-downloads="galleryAllowsDownloads"
      />
      <UTooltip v-if="allowIndividualPurchase" text="Alterar preço da foto">
        <UPopover>
          <UButton
            icon="i-lucide-banknote"
            aria-label="Alterar preço da foto"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full bg-black/25 text-white backdrop-blur-md hover:bg-black/45"
          />
          <template #content>
            <div class="p-3">
              <CAdminGalleryPhotoPriceForm
                :photo="photo"
                :default-price="defaultPhotoPrice"
                :default-currency="galleryCurrency"
              />
            </div>
          </template>
        </UPopover>
      </UTooltip>
      <UTooltip
        :text="
          photo.source_file_id ? 'Reimportar esta foto do Drive' : 'Foto sem arquivo de origem'
        "
      >
        <UButton
          icon="i-lucide-refresh-cw"
          :aria-label="`Sincronizar ${photo.name}`"
          color="neutral"
          variant="ghost"
          size="sm"
          class="rounded-full bg-black/25 text-white backdrop-blur-md hover:bg-black/45"
          :disabled="!photo.source_file_id || syncDisabled"
          :loading="syncing"
          @click="emit('sync', photo)"
        />
      </UTooltip>
    </div>
  </UCard>
</template>
