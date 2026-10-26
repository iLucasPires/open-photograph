<script setup lang="ts">
import CPhotoFeedback from './gallery-photo-feedback.vue'
import { downloadPhoto } from '@/app/features/gallery/utils/photo.ts'
import { getSession } from '@/app/shared/services/session'
import { useMutation } from '@tanstack/vue-query'
import type { PublicPhoto, Gallery, CreateOrderPayload } from '@/app/features/gallery/types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{
  photo: PublicPhoto | null
  gallery: Gallery
  open: boolean
  photoIndex?: number
  totalPhotos?: number
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  prev: []
  next: []
}>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const router = useRouter()
const route = useRoute()
const toast = useToast()

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const displayUrl = computed(getDisplayUrl)
const canDownload = computed(getCanDownload)
const canBuyPhoto = computed(getCanBuyPhoto)
const canBuyGallery = computed(getCanBuyGallery)
const showSidebar = computed(getShowSidebar)
const photoPrice = computed(getPhotoPrice)
const galleryPrice = computed(getGalleryPrice)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const orderMutation = useMutation({
  mutationFn: submitOrderMutation,
})
const download = useMutation({
  mutationFn: submitDownload,
  onError: handleDownloadError,
})

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------
// Navegação por teclado
defineShortcuts({
  arrowleft: () => {
    if (props.open) emit('prev')
  },
  arrowright: () => {
    if (props.open) emit('next')
  },
})

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getDisplayUrl() {
  return props.photo?.watermarked_preview ?? props.photo?.preview ?? props.photo?.thumbnail
}

function getShowSidebar() {
  return (
    props.gallery.allow_comments ||
    canBuyPhoto.value ||
    canBuyGallery.value ||
    props.photo?.can_download_original ||
    props.gallery.included_eligible
  )
}

function getCanDownload() {
  return props.photo?.can_download ?? false
}

function getCanBuyPhoto() {
  return (
    props.gallery.enable_sales && props.gallery.allow_individual_purchase && !!props.photo?.price
  )
}

function getCanBuyGallery() {
  return props.gallery.enable_sales && !!props.gallery.gallery_price
}

function getPhotoPrice() {
  if (!props.photo?.price) return null
  return `${props.photo.price_currency} ${parseFloat(props.photo.price).toFixed(2)}`
}

function getGalleryPrice() {
  if (!props.gallery.gallery_price) return null
  return `${props.gallery.gallery_price_currency} ${Number(props.gallery.package_remaining ?? props.gallery.gallery_price).toFixed(2)}`
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function handleBuyPhoto() {
  if (!props.photo) return
  orderMutation.mutate({
    photo_ids: [props.photo.id],
  })
}

function handleBuyGallery() {
  orderMutation.mutate({
    gallery_id: props.gallery.id,
  })
}

async function submitOrderMutation(payload: CreateOrderPayload) {
  const target = {
    path: `/g/${String(route.params.slug)}/checkout`,
    query: payload.gallery_id ? { package: '1' } : { photo: payload.photo_ids?.join(',') },
  }
  const session = await getSession()
  if (!session?.meta.is_authenticated) {
    await router.push({
      name: 'gallery.login',
      query: { next: router.resolve(target).fullPath },
    })
  } else {
    await router.push(target)
  }
}

function submitDownload() {
  return downloadPhoto(props.gallery, props.photo)
}

function handleDownloadError() {
  return toast.add({
    title: 'Não foi possível baixar esta foto. Atualize a galeria e tente novamente.',
    color: 'error',
  })
}
</script>

<template>
  <UModal
    :open="open"
    :title="photo?.name ?? 'Visualizar foto'"
    :description="gallery.name"
    :ui="{
      content: 'w-[calc(100vw-1.5rem)] max-w-7xl overflow-hidden divide-y-0',
    }"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div
        v-if="photo"
        class="flex h-[calc(100dvh-2rem)] max-h-[960px] min-h-0 flex-col sm:h-[90dvh]"
      >
        <div
          class="flex shrink-0 items-center justify-between gap-4 border-b border-default px-4 py-3 sm:px-5"
        >
          <div class="flex min-w-0 items-center gap-3">
            <UIcon name="i-lucide-image" class="hidden size-5 shrink-0 text-dimmed sm:block" />
            <div class="min-w-0">
              <h2 class="truncate text-sm font-medium text-highlighted">{{ photo.name }}</h2>
              <p class="truncate text-xs text-muted">{{ gallery.name }}</p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <UTooltip v-if="canDownload" text="Baixar prévia">
              <UButton
                icon="i-lucide-download"
                aria-label="Baixar prévia"
                color="neutral"
                variant="ghost"
                class="rounded-full"
                @click.stop="download.mutate()"
                :loading="download.isPending.value"
              />
            </UTooltip>
            <USeparator orientation="vertical" class="mx-2 h-5" />
            <UTooltip text="Fechar visualizador">
              <UButton
                icon="i-lucide-x"
                aria-label="Fechar visualizador"
                color="neutral"
                variant="ghost"
                class="rounded-full"
                @click="emit('update:open', false)"
              />
            </UTooltip>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
          <div
            class="relative flex min-h-64 flex-1 items-center justify-center overflow-hidden bg-muted/50 max-md:h-[55dvh] max-md:shrink-0 md:min-w-0"
          >
            <img
              v-if="displayUrl"
              :src="displayUrl"
              :alt="photo.name"
              class="absolute inset-0 size-full object-contain p-3 sm:p-6 lg:p-8"
            />
            <USkeleton v-else class="h-2/3 w-1/2 rounded-lg" />

            <template v-if="(totalPhotos ?? 2) > 1">
              <UTooltip text="Foto anterior">
                <UButton
                  icon="i-lucide-chevron-left"
                  aria-label="Foto anterior"
                  color="neutral"
                  variant="ghost"
                  size="lg"
                  class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-default/85 text-highlighted shadow-sm ring-1 ring-default backdrop-blur-md hover:bg-default sm:left-5"
                  @click="emit('prev')"
                />
              </UTooltip>
              <UTooltip text="Próxima foto">
                <UButton
                  icon="i-lucide-chevron-right"
                  aria-label="Próxima foto"
                  color="neutral"
                  variant="ghost"
                  size="lg"
                  class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-default/85 text-highlighted shadow-sm ring-1 ring-default backdrop-blur-md hover:bg-default sm:right-5"
                  @click="emit('next')"
                />
              </UTooltip>
            </template>
          </div>

          <aside
            v-if="showSidebar"
            class="flex w-full shrink-0 flex-col border-t border-default bg-default md:w-[360px] md:min-h-0 md:border-l md:border-t-0 lg:w-96"
          >
            <div v-if="gallery.allow_comments" class="flex min-h-0 flex-1 flex-col">
              <CPhotoFeedback :key="photo.id" :photo="photo" :gallery="gallery" expanded />
            </div>
            <div
              v-if="
                canBuyPhoto ||
                canBuyGallery ||
                photo.can_download_original ||
                gallery.included_eligible
              "
              class="shrink-0 space-y-3 border-t border-default bg-elevated/30 p-5"
            >
              <CGalleryIncludedPhotoAction :gallery="gallery" :photo="photo" />
              <p v-if="canBuyPhoto || canBuyGallery" class="text-xs font-medium text-muted">
                Leve suas fotos com você
              </p>
              <UButton
                v-if="canBuyPhoto"
                :label="`Comprar foto · ${photoPrice}`"
                icon="i-lucide-shopping-bag"
                color="neutral"
                block
                :loading="orderMutation.isPending.value"
                @click="handleBuyPhoto"
              />
              <UButton
                v-if="canBuyGallery"
                :label="`Galeria completa · ${galleryPrice}`"
                icon="i-lucide-images"
                color="neutral"
                variant="outline"
                block
                :loading="orderMutation.isPending.value"
                @click="handleBuyGallery"
              />
            </div>
          </aside>
        </div>

        <div
          class="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-t border-default px-4 py-3 sm:px-5"
        >
          <div class="flex items-center gap-3">
            <span v-if="totalPhotos" class="text-xs tabular-nums text-muted"
              >{{ (photoIndex ?? 0) + 1 }} <span class="mx-1 text-dimmed">/</span>
              {{ totalPhotos }}</span
            >
            <CPhotoFeedback
              v-if="!gallery.allow_comments"
              :key="photo.id"
              :photo="photo"
              :gallery="gallery"
            />
          </div>
          <span class="hidden items-center gap-2 text-xs text-dimmed sm:flex"
            ><UIcon name="i-lucide-arrow-left-right" class="size-3.5" /> Use as setas para navegar
            <span class="mx-1">·</span> Esc para fechar</span
          >
        </div>
      </div>
    </template>
  </UModal>
</template>
