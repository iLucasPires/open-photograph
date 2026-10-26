<script setup lang="ts">
import CAdminGalleryPhotoCard from '../../components/gallery/photos/admin-gallery-photo-card.vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { Gallery } from '@/app/features/gallery/types/gallery'
import type { Photo } from '@/app/features/gallery/types/photo'
import type { iApiPaginationNumber } from '@/app/shared/types'
import GalleryFormModal from '../../components/gallery/form/admin-gallery-form-modal.vue'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'AdminGalleryPhotosPage' })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const PAGE_SIZE = 12
const REFETCH_INTERVAL = 5000
const PHOTO_SKELETON_COUNT = 8
const MESSAGES = {
  gallerySyncRequested: 'Sincronização da galeria solicitada',
  gallerySyncFailed:
    'Não foi possível sincronizar a galeria. Confira a conexão do Drive e tente novamente.',
  publicationUpdated: 'Publicação atualizada',
  publicationFailed: 'Não foi possível atualizar a publicação.',
  watermarkRequested: "Marca d'água solicitada para as fotos",
  watermarkFailed: "Não foi possível reaplicar a marca d'água.",
  photoSyncRequested: 'Sincronização da foto solicitada',
  photoSyncFailed: 'Não foi possível sincronizar a foto. Tente novamente.',
}

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute()
const overlay = useOverlay()
const toast = useToast()
const queryClient = useQueryClient()
const galleryModal = overlay.create(GalleryFormModal)

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const page = ref(1)
const showingFeedback = ref(false)
const syncError = ref('')
const syncingPhotos = reactive(new Set<string>())

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const galleryId = computed(getGalleryId)

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: gallery,
  isPending: loadingGallery,
  isError: galleryError,
  refetch: refetchGallery,
} = useQuery({
  queryKey: computed(getGalleryKey),
  queryFn: fetchGallery,
  refetchInterval: REFETCH_INTERVAL,
})
const {
  data: photoPage,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: computed(getPhotosKey),
  queryFn: fetchPhotos,
  enabled: computed(getPhotosEnabled),
  refetchInterval: REFETCH_INTERVAL,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const hasFolder = computed(getHasFolder)
const pageTitle = computed(getPageTitle)
const showPhotoSkeleton = computed(getShowPhotoSkeleton)
const showLoadError = computed(getShowLoadError)
const showPagination = computed(getShowPagination)
const allowIndividualPurchase = computed(getAllowIndividualPurchase)
const loadErrorActions = computed(getLoadErrorActions)
const feedbackToggleLabel = computed(getFeedbackToggleLabel)
const feedbackToggleIcon = computed(getFeedbackToggleIcon)
const publicationBadgeLabel = computed(getPublicationBadgeLabel)
const publicationBadgeColor = computed(getPublicationBadgeColor)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const syncGallery = useMutation({
  mutationFn: postGallerySync,
  onMutate: clearSyncError,
  onSuccess: handleGallerySyncSuccess,
  onError: handleGallerySyncError,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const emptyActions = computed(getEmptyActions)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const publication = useMutation({
  mutationFn: postPublication,
  onSuccess: handlePublicationSuccess,
  onError: handlePublicationError,
})
const reapplyWatermark = useMutation({
  mutationFn: postReapplyWatermark,
  onMutate: clearSyncError,
  onSuccess: handleWatermarkSuccess,
  onError: handleWatermarkError,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const isBusy = computed(getIsBusy)
const galleryActions = computed(getGalleryActions)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const syncPhoto = useMutation({
  mutationFn: postPhotoSync,
  onMutate: startPhotoSync,
  onSuccess: handlePhotoSyncSuccess,
  onError: handlePhotoSyncError,
  onSettled: finishPhotoSync,
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(galleryId, resetPage)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function resetPage() {
  page.value = 1
}

function clearSyncError() {
  syncError.value = ''
}

function dismissSyncError() {
  syncError.value = ''
}

function toggleFeedback() {
  showingFeedback.value = !showingFeedback.value
}

function postGallerySync() {
  return apiFetch(`/api/galleries/${galleryId.value}/sync/`, { method: 'POST' })
}

function requestGallerySync() {
  syncGallery.mutate()
}

function postPublication(publish: boolean) {
  const action = publish ? 'publish' : 'unpublish'
  return apiFetch(`/api/galleries/${galleryId.value}/${action}/`, { method: 'POST' })
}

function togglePublication() {
  publication.mutate(!gallery.value?.is_published)
}

function postReapplyWatermark() {
  return apiFetch(`/api/galleries/${galleryId.value}/reapply-watermark/`, { method: 'POST' })
}

function requestReapplyWatermark() {
  reapplyWatermark.mutate()
}

function postPhotoSync(photo: Photo) {
  return apiFetch(`/api/photos/${photo.id}/sync/`, { method: 'POST' })
}

function startPhotoSync(photo: Photo) {
  syncingPhotos.add(photo.id)
  syncError.value = ''
}

function finishPhotoSync(_data: unknown, _error: unknown, photo: Photo) {
  syncingPhotos.delete(photo.id)
}

function requestPhotoSync(photo: Photo) {
  syncPhoto.mutate(photo)
}

function openGalleryModal() {
  galleryModal.open({ gallery: gallery.value })
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getGalleryKey() {
  return ['galleries', 'detail', galleryId.value]
}

function getPhotosKey() {
  return ['admin-gallery-photos', galleryId.value, page.value]
}

function getPhotosEnabled() {
  return !!gallery.value
}

function getHasFolder() {
  return !!gallery.value?.source_folder_id
}

function getIsBusy() {
  return (
    syncGallery.isPending.value || reapplyWatermark.isPending.value || publication.isPending.value
  )
}

function getGalleryActions() {
  const current = gallery.value

  return [
    [
      {
        label: current?.is_published ? 'Retirar do ar' : 'Publicar galeria',
        icon: current?.is_published ? 'i-lucide-eye-off' : 'i-lucide-globe',
        disabled: isBusy.value,
        onSelect: togglePublication,
      },
      {
        label: 'Configurar galeria',
        icon: 'i-lucide-settings',
        onSelect: openGalleryModal,
      },
      {
        label: 'Abrir galeria',
        icon: 'i-lucide-external-link',
        to: `/g/${current?.slug}`,
        target: '_blank',
        disabled: !current?.is_published,
      },
    ],
    [
      {
        label: "Reaplicar marca d'água",
        icon: 'i-lucide-stamp',
        disabled: !current?.watermark_enabled || isBusy.value,
        onSelect: requestReapplyWatermark,
      },
      {
        label: 'Sincronizar galeria inteira',
        icon: 'i-lucide-refresh-cw',
        disabled: !hasFolder.value || isBusy.value,
        onSelect: requestGallerySync,
      },
    ],
  ]
}

function getPageTitle() {
  return gallery.value?.name ? `Fotos · ${gallery.value.name}` : 'Fotos da galeria'
}

function getShowPhotoSkeleton() {
  return !showingFeedback.value && (loadingGallery.value || (!!gallery.value && isPending.value))
}

function getShowLoadError() {
  return !showingFeedback.value && (galleryError.value || isError.value)
}

function getShowPagination() {
  return !showingFeedback.value && !!photoPage.value && photoPage.value.count > PAGE_SIZE
}

function getAllowIndividualPurchase() {
  return (
    gallery.value?.enable_sales &&
    (gallery.value.allow_individual_purchase || gallery.value.included_photo_mode === 'client')
  )
}

function getLoadErrorActions() {
  return [
    {
      label: 'Tentar novamente',
      color: 'neutral' as const,
      variant: 'outline' as const,
      onClick: retryLoad,
    },
  ]
}

function getEmptyActions() {
  return [
    {
      label: 'Importar fotos',
      color: 'neutral' as const,
      icon: 'i-lucide-refresh-cw',
      disabled: !hasFolder.value,
      loading: syncGallery.isPending.value,
      onClick: requestGallerySync,
    },
  ]
}

function getFeedbackToggleLabel() {
  return showingFeedback.value ? 'Ver fotos' : 'Feedback dos clientes'
}

function getFeedbackToggleIcon() {
  return showingFeedback.value ? 'i-lucide-images' : 'i-lucide-message-circle'
}

function getPublicationBadgeLabel() {
  return gallery.value?.is_published ? 'Publicada' : 'Rascunho'
}

function getPublicationBadgeColor() {
  return gallery.value?.is_published ? 'success' : 'neutral'
}

function getGalleryId() {
  return String(route.params.galleryId)
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function handleGallerySyncSuccess() {
  toast.add({ title: MESSAGES.gallerySyncRequested, color: 'success' })
  await refreshPhotos()
}

function handleGallerySyncError() {
  syncError.value = MESSAGES.gallerySyncFailed
}

async function handlePublicationSuccess() {
  toast.add({ title: MESSAGES.publicationUpdated, color: 'success' })
  await queryClient.invalidateQueries({ queryKey: ['galleries'] })
}

function handlePublicationError() {
  syncError.value = MESSAGES.publicationFailed
}

async function handleWatermarkSuccess() {
  toast.add({ title: MESSAGES.watermarkRequested, color: 'success' })
  await refreshPhotos()
}

function handleWatermarkError() {
  syncError.value = MESSAGES.watermarkFailed
}

async function handlePhotoSyncSuccess(_data: unknown, photo: Photo) {
  toast.add({
    title: MESSAGES.photoSyncRequested,
    description: photo.name,
    color: 'success',
  })
  await refreshPhotos()
}

function handlePhotoSyncError() {
  syncError.value = MESSAGES.photoSyncFailed
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchGallery() {
  return apiFetch<Gallery>(`/api/galleries/${galleryId.value}/`)
}

function fetchPhotos() {
  return apiFetch<iApiPaginationNumber<Photo>>('/api/photos/', {
    query: { gallery: galleryId.value, page: page.value, page_size: PAGE_SIZE },
  })
}

async function refreshPhotos() {
  await queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos', galleryId.value] })
  await queryClient.invalidateQueries({ queryKey: ['photos', galleryId.value] })
  await queryClient.invalidateQueries({ queryKey: ['galleries'] })
}

function retryLoad() {
  refetchGallery()
  refetch()
}
</script>

<template>
  <CAdminPageFrame
    :title="pageTitle"
    description="Gerencie as fotos, os preços e a publicação da galeria."
    :eyebrow="`Galeria · ${photoPage?.count ?? 0} fotos`"
  >
    <template #actions>
      <UButton
        label="Voltar"
        icon="i-lucide-arrow-left"
        to="/admin/galleries"
        color="neutral"
        variant="ghost"
        size="sm"
      />
      <template v-if="gallery">
        <UButton
          :label="feedbackToggleLabel"
          :icon="feedbackToggleIcon"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="toggleFeedback"
        />
        <UButton
          v-if="photoPage?.count"
          label="Sincronizar"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="!hasFolder || isBusy"
          :loading="syncGallery.isPending.value"
          @click="requestGallerySync"
        />
        <UTooltip v-if="gallery.is_published" text="Abrir galeria">
          <UButton
            target="_blank"
            icon="i-lucide-external-link"
            aria-label="Abrir galeria"
            color="neutral"
            variant="ghost"
            size="sm"
            :to="`/g/${gallery.slug}`"
          />
        </UTooltip>
        <UDropdownMenu :items="galleryActions" :content="{ align: 'end' }">
          <UButton
            label="Ações"
            trailing-icon="i-lucide-chevron-down"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="isBusy"
          />
        </UDropdownMenu>
      </template>
    </template>

    <div class="space-y-5">
      <div v-if="gallery" class="flex items-center gap-3">
        <span class="text-sm font-medium text-highlighted">Fotos</span>
        <span class="text-xs text-muted">{{ photoPage?.count ?? 0 }}</span>
        <USeparator orientation="vertical" class="h-4" />
        <UBadge
          :label="publicationBadgeLabel"
          :color="publicationBadgeColor"
          variant="soft"
          size="sm"
        />
      </div>

      <UAlert
        v-if="gallery && !hasFolder"
        icon="i-lucide-folder-x"
        color="warning"
        variant="subtle"
        title="Nenhuma pasta do Drive vinculada"
        description="Vincule uma pasta nas configurações para sincronizar a galeria."
      />

      <UAlert
        v-if="syncError"
        color="error"
        variant="subtle"
        close
        :title="syncError"
        @update:open="dismissSyncError"
      />

      <UPageGrid v-if="showPhotoSkeleton" class="lg:grid-cols-3 xl:grid-cols-4">
        <USkeleton
          v-for="n in PHOTO_SKELETON_COUNT"
          :key="n"
          class="aspect-2/3 w-full rounded-2xl"
        />
      </UPageGrid>

      <UAlert
        v-else-if="showLoadError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        title="Não foi possível carregar as fotos."
        :actions="loadErrorActions"
      />

      <CGalleryFeedbackPanel v-else-if="showingFeedback" :gallery-id="galleryId" />
      <UPageGrid v-else-if="photoPage?.results.length" class="lg:grid-cols-3 xl:grid-cols-4">
        <CAdminGalleryPhotoCard
          v-for="photo in photoPage.results"
          :key="photo.id"
          :photo="photo"
          :included-photo-mode="gallery?.included_photo_mode"
          :allow-individual-purchase="allowIndividualPurchase"
          :sync-disabled="syncGallery.isPending.value"
          :syncing="syncingPhotos.has(photo.id)"
          :gallery-allows-downloads="gallery?.allow_downloads ?? false"
          :default-photo-price="gallery?.default_photo_price"
          :gallery-currency="gallery?.gallery_price_currency"
          @sync="requestPhotoSync"
        />
      </UPageGrid>

      <UEmpty
        v-else
        icon="i-lucide-images"
        title="Sua galeria começa aqui"
        :ui="{ root: 'border-0 py-16 sm:py-20', avatar: 'mb-2' }"
        description="Sincronize a galeria para importar as fotos da pasta vinculada."
        :actions="emptyActions"
      />
    </div>

    <div v-if="showPagination" class="flex justify-end">
      <UPagination v-model:page="page" :total="photoPage?.count ?? 0" :items-per-page="PAGE_SIZE" />
    </div>
  </CAdminPageFrame>
</template>
