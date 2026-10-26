<script setup lang="ts">
import type {
  GalleryWithPhotos,
  CheckoutErrorItem,
  CheckoutError,
} from '@/app/features/gallery/types/checkout'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { Order, PublicPhoto } from '../types'
import { getSession } from '@/app/shared/services/session'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const ACCESS_CODE_HEADER = 'X-Gallery-Access-Code'
const LOCALE = 'pt-BR'
const DEFAULT_CURRENCY = 'BRL'
const EMAIL_VERIFICATION_CODE = 'email_verification_required'
const MESSAGES = {
  paymentUnavailable: 'Não foi possível abrir o pagamento.',
  checkoutFailed: 'Não foi possível iniciar a compra.',
  verificationFailed: 'Não foi possível enviar a confirmação. Aguarde um pouco e tente novamente.',
  sessionUnavailable: 'Sessão indisponível.',
}
const emptyActions = [{ label: 'Escolher fotos', to: '', color: 'neutral' as const }]

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute()
const router = useRouter()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const requestId = ref(crypto.randomUUID())
const errorMessage = ref('')
const needsEmailVerification = ref(false)
const verificationSent = ref(false)
const verificationError = ref('')

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const slug = computed(getSlug)

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const accessCode = useSessionStorage<string>(`gallery-access:${slug.value}`, '')

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: gallery,
  isPending,
  isError,
} = useQuery({
  queryKey: computed(getGalleryKey),
  queryFn: fetchGallery,
  enabled: computed(getGalleryEnabled),
  retry: false,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const wholeGallery = computed(getWholeGallery)
const photoIds = computed(getPhotoIds)
const selectedPhotos = computed(getSelectedPhotos)
const valid = computed(getValid)
const currency = computed(getCurrency)
const total = computed(getTotal)
const itemCount = computed(getItemCount)
const purchasesPath = computed(getPurchasesPath)
const galleryPath = computed(getGalleryPath)
const photosNoun = computed(getPhotosNoun)
const selectionBadgeLabel = computed(getSelectionBadgeLabel)
const hasPackageDiscount = computed(getHasPackageDiscount)
const verificationButtonLabel = computed(getVerificationButtonLabel)
const checkoutButtonLabel = computed(getCheckoutButtonLabel)
const unavailableActions = computed(getUnavailableActions)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const sendVerification = useMutation({
  mutationFn: postVerification,
  onMutate: clearVerificationError,
  onSuccess: markVerificationSent,
  onError: handleVerificationError,
})
const checkout = useMutation({
  mutationFn: postCheckout,
  onSuccess: handleCheckoutSuccess,
  onError: handleCheckoutError,
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(() => route.fullPath, resetCheckoutState)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function resetCheckoutState() {
  requestId.value = crypto.randomUUID()
  errorMessage.value = ''
  needsEmailVerification.value = false
}

function hasMatchingPrice(photo: PublicPhoto) {
  return !!photo.price && photo.price_currency === selectedPhotos.value[0]?.price_currency
}

function allSelectedPhotosPriced() {
  for (const photo of selectedPhotos.value) {
    if (!hasMatchingPrice(photo)) return false
  }
  return true
}

function sumPhotoPrices() {
  let sum = 0
  for (const photo of selectedPhotos.value) sum += Number(photo.price)
  return sum
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency.value || DEFAULT_CURRENCY,
  }).format(value)
}

async function postVerification() {
  const session = await getSession()
  const email = session?.data.user?.email
  if (!email) throw new Error(MESSAGES.sessionUnavailable)

  await apiFetch('/api/browser/v1/account/email', { method: 'PUT', body: { email } })
}

function clearVerificationError() {
  verificationError.value = ''
}

function markVerificationSent() {
  verificationSent.value = true
}

function requestVerification() {
  sendVerification.mutate()
}

function postCheckout() {
  const target = wholeGallery.value
    ? { gallery_id: gallery.value?.id }
    : { photo_ids: photoIds.value }

  return apiFetch<Order>('/api/commerce/orders/checkout/', {
    method: 'POST',
    body: {
      request_id: requestId.value,
      access_code: accessCode.value,
      ...target,
    },
  })
}

function requiresEmailVerification(item: CheckoutErrorItem) {
  return item.code === EMAIL_VERIFICATION_CODE
}

function requestCheckout() {
  checkout.mutate()
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getSlug() {
  return String(route.params.slug)
}

function getPurchasesPath() {
  return `/g/${slug.value}/purchases`
}

function getGalleryPath() {
  return `/g/${slug.value}`
}

function getGalleryKey() {
  return ['galleries', 'slug', slug.value, accessCode.value]
}

function getGalleryEnabled() {
  return !!slug.value
}

function getWholeGallery() {
  return route.query.package === '1'
}

function getPhotoIds() {
  const photo = route.query.photo
  if (typeof photo !== 'string') return []

  const ids = new Set<string>()
  for (const id of photo.split(',')) {
    if (id) ids.add(id)
  }
  return [...ids]
}

function getSelectedPhotos() {
  const photos = gallery.value?.photos ?? []
  const selected: PublicPhoto[] = []
  for (const photo of photos) {
    if (photoIds.value.includes(photo.id)) selected.push(photo)
  }
  return selected
}

function getValid() {
  const current = gallery.value
  if (!current?.enable_sales) return false

  if (wholeGallery.value) return !!current.gallery_price && current.photos.length > 0

  return (
    current.allow_individual_purchase &&
    selectedPhotos.value.length > 0 &&
    selectedPhotos.value.length === photoIds.value.length &&
    allSelectedPhotosPriced()
  )
}

function getCurrency() {
  return wholeGallery.value
    ? gallery.value?.gallery_price_currency
    : selectedPhotos.value[0]?.price_currency
}

function getTotal() {
  if (wholeGallery.value) {
    return Number(gallery.value?.package_remaining ?? gallery.value?.gallery_price ?? 0)
  }
  return sumPhotoPrices()
}

function getItemCount() {
  return wholeGallery.value ? (gallery.value?.photos.length ?? 0) : selectedPhotos.value.length
}

function getPhotosNoun() {
  return itemCount.value === 1 ? 'fotografia' : 'fotografias'
}

function getSelectionBadgeLabel() {
  return wholeGallery.value ? 'Galeria completa' : 'Fotos selecionadas'
}

function getHasPackageDiscount() {
  return wholeGallery.value && Number(gallery.value?.package_discount ?? 0) > 0
}

function getVerificationButtonLabel() {
  return verificationSent.value ? 'Reenviar confirmação' : 'Enviar email de confirmação'
}

function getCheckoutButtonLabel() {
  return wholeGallery.value && total.value === 0 ? 'Liberar pacote' : 'Ir para pagamento'
}

function getUnavailableActions() {
  return [{ label: emptyActions[0]!.label, to: galleryPath.value, color: 'neutral' as const }]
}

function getPhotoPreview(photo: PublicPhoto) {
  return photo.watermarked_preview || photo.thumbnail || ''
}

function getPhotoPrice(photo: PublicPhoto) {
  return formatMoney(Number(photo.price))
}

function getErrorDetail(item: CheckoutErrorItem) {
  return item.detail
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function handleVerificationError() {
  verificationError.value = MESSAGES.verificationFailed
}

function handleCheckoutSuccess(order: Order) {
  needsEmailVerification.value = false

  if (order.status === 'paid') {
    void router.push(purchasesPath.value)
    return
  }

  if (order.checkout_url) {
    window.location.assign(order.checkout_url)
    return
  }

  errorMessage.value = MESSAGES.paymentUnavailable
}

function handleCheckoutError(error: unknown) {
  const response = (error as CheckoutError).data
  const errors = response?.errors

  needsEmailVerification.value = errors?.some(requiresEmailVerification) ?? false
  errorMessage.value =
    errors?.map(getErrorDetail).join(' ') || response?.detail || MESSAGES.checkoutFailed
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchGallery() {
  return apiFetch<GalleryWithPhotos>(`/api/galleries/public/${encodeURIComponent(slug.value)}/`, {
    headers: { [ACCESS_CODE_HEADER]: accessCode.value },
  })
}
</script>

<template>
  <CGalleryCommerceFrame
    title="Confirmar compra"
    eyebrow="Suas fotografias"
    description="Confira sua seleção antes de continuar para o pagamento."
  >
    <template #actions>
      <UButton
        label="Minhas fotos"
        icon="i-lucide-shopping-bag"
        :to="purchasesPath"
        color="neutral"
        variant="outline"
        class="rounded-full"
      />
    </template>
    <USkeleton v-if="isPending" class="h-80 w-full rounded-2xl" />
    <UEmpty
      v-else-if="isError || !valid"
      icon="i-lucide-shopping-bag"
      title="Seleção indisponível"
      description="Volte à galeria e escolha novamente as fotos que deseja comprar."
      :actions="unavailableActions"
    />
    <div v-else class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <UCard :ui="{ root: 'rounded-2xl shadow-none ring-default/60' }">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-1">
              <h2 class="text-base font-medium text-highlighted">{{ gallery?.name }}</h2>
              <p class="text-xs text-muted">{{ itemCount }} {{ photosNoun }}</p>
            </div>
            <UBadge :label="selectionBadgeLabel" color="neutral" variant="subtle" />
          </div>
        </template>
        <div v-if="wholeGallery" class="flex gap-4 py-4">
          <UIcon name="i-lucide-images" class="size-8 shrink-0 text-muted" />
          <div class="space-y-2">
            <p class="text-sm font-medium text-highlighted">Uma coleção completa</p>
            <p class="text-sm leading-relaxed text-muted">
              O pacote inclui as fotos disponíveis nesta galeria no momento da compra.
            </p>
          </div>
        </div>
        <ul v-else class="max-h-[480px] divide-y divide-default/60 overflow-y-auto">
          <li
            v-for="photo in selectedPhotos"
            :key="photo.id"
            class="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
          >
            <img
              v-if="getPhotoPreview(photo)"
              :src="getPhotoPreview(photo)"
              :alt="photo.name"
              class="size-16 shrink-0 rounded-lg object-cover"
              loading="lazy"
            />
            <UIcon v-else name="i-lucide-image" class="size-10 shrink-0 text-muted" />
            <span class="min-w-0 flex-1 break-words text-sm text-highlighted">{{
              photo.name
            }}</span>
            <span class="shrink-0 text-sm tabular-nums text-muted">{{ getPhotoPrice(photo) }}</span>
          </li>
        </ul>
      </UCard>
      <UCard :ui="{ root: 'rounded-2xl shadow-none ring-default/60', body: 'space-y-6' }">
        <h2 class="text-sm font-medium text-highlighted">Resumo da compra</h2>
        <div v-if="hasPackageDiscount" class="space-y-2 text-sm">
          <div class="flex justify-between gap-3 text-muted">
            <span>Preço do pacote</span>
            <span>{{ formatMoney(Number(gallery?.gallery_price)) }}</span>
          </div>
          <div class="flex justify-between gap-3 text-muted">
            <span>Fotos individuais já pagas</span>
            <span>− {{ formatMoney(Number(gallery?.package_discount)) }}</span>
          </div>
          <p class="text-xs leading-relaxed text-muted">
            Abatimento dos valores pagos em pedidos aprovados na moeda do pacote. Fotos incluídas no
            trabalho não geram abatimento em dinheiro.
          </p>
        </div>
        <div class="flex items-baseline justify-between gap-3">
          <span class="text-sm text-muted">Total</span>
          <span class="text-3xl font-medium tracking-tight text-highlighted tabular-nums">{{
            formatMoney(total)
          }}</span>
        </div>
        <USeparator />
        <div class="flex gap-3">
          <UIcon name="i-lucide-download" class="mt-0.5 size-5 shrink-0 text-muted" />
          <p class="text-sm leading-relaxed text-muted">
            Após a aprovação, baixe os JPEGs originais sem marca d'água e sem redução de qualidade
            em Minhas fotos.
          </p>
        </div>
        <UAlert v-if="errorMessage" :title="errorMessage" color="error" variant="subtle" />
        <div v-if="needsEmailVerification" class="space-y-3">
          <p class="text-sm leading-relaxed text-muted">
            Confirme o email da sua conta para acessar o cadastro existente. Depois de abrir o link
            recebido, volte aqui e tente o pagamento novamente.
          </p>
          <UAlert
            v-if="verificationSent"
            title="Confirmação enviada"
            description="Confira sua caixa de entrada e a pasta de spam."
            color="success"
            variant="subtle"
          />
          <UAlert
            v-if="verificationError"
            :title="verificationError"
            color="error"
            variant="subtle"
          />
          <UButton
            :label="verificationButtonLabel"
            icon="i-lucide-mail"
            color="neutral"
            variant="outline"
            class="rounded-full"
            :loading="sendVerification.isPending.value"
            @click="requestVerification"
          />
        </div>
        <UButton
          :label="checkoutButtonLabel"
          trailing-icon="i-lucide-arrow-up-right"
          color="neutral"
          size="lg"
          block
          class="rounded-full"
          :loading="checkout.isPending.value"
          @click="requestCheckout"
        />
        <p class="text-xs leading-relaxed text-muted">
          Você será direcionado ao provedor para concluir o pagamento. A liberação depende da
          confirmação do pagamento.
        </p>
      </UCard>
    </div>
  </CGalleryCommerceFrame>
</template>
