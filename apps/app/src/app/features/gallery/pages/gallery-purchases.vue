<script setup lang="ts">
import type { OrdersPage, OrdersQuery } from '@/app/features/gallery/types/purchases'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import { downloadPhoto } from '../utils/photo'
import type { Order, PublicPhoto } from '../types'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const ACCESS_CODE_HEADER = 'X-Gallery-Access-Code'
const LOCALE = 'pt-BR'
const PAGE_SIZE = 10
const PENDING_REFETCH_INTERVAL = 30000
const ORDER_ID_PREVIEW_LENGTH = 8
const MESSAGES = {
  downloadFailed: 'Não foi possível baixar o original. Tente novamente.',
  pendingCheckFailed: 'Não foi possível consultar o pagamento agora. Tente atualizar novamente.',
  refreshFailed: 'Não foi possível verificar o pagamento.',
}
const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Reembolsado',
  expired: 'Expirado',
}
const STATUS_DESCRIPTIONS: Record<Order['status'], string> = {
  pending: 'Aguardando a confirmação do pagamento. Os downloads serão liberados após a aprovação.',
  paid: 'Pagamento aprovado. Seus arquivos originais estão disponíveis para download.',
  failed: 'O pagamento não foi concluído. Volte à galeria para iniciar uma nova compra.',
  refunded: 'O pagamento foi reembolsado. Os downloads deste pedido não estão disponíveis.',
  expired: 'O prazo de pagamento terminou. Volte à galeria para iniciar uma nova compra.',
}
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' })

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute()
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const page = ref(1)
const errorMessage = ref('')

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const slug = computed(getSlug)

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const includedCode = useSessionStorage<string>(computed(getAccessStorageKey), '')

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data, isPending, isError, isFetching, refetch } = useQuery({
  queryKey: computed(getPurchasesKey),
  queryFn: fetchPurchases,
  refetchInterval: getRefetchInterval,
})

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const retryPurchasesActions = [{ label: 'Tentar novamente', onClick: retryPurchases }]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: included,
  isPending: includedPending,
  isError: includedError,
  refetch: refetchIncluded,
} = useQuery({
  queryKey: computed(getIncludedKey),
  queryFn: fetchIncluded,
})

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const retryIncludedActions = [{ label: 'Tentar novamente', onClick: retryIncluded }]

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const galleryPath = computed(getGalleryPath)
const exploreActions = computed(getExploreActions)
const ordersCountLabel = computed(getOrdersCountLabel)
const showPagination = computed(getShowPagination)
const showEmpty = computed(getShowEmpty)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const includedDownload = useMutation({
  mutationFn: downloadIncludedPhoto,
  onError: handleIncludedDownloadError,
})
const refresh = useMutation({
  mutationFn: postOrderRefresh,
  onSuccess: invalidatePurchases,
  onError: handleRefreshError,
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(slug, resetPage)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function resetPage() {
  page.value = 1
}

function downloadIncludedPhoto(photo: PublicPhoto) {
  return downloadPhoto({ slug: slug.value }, photo, true)
}

function downloadIncluded(photo: PublicPhoto) {
  includedDownload.mutate(photo)
}

function isDownloadingIncluded(photo: PublicPhoto) {
  return includedDownload.isPending.value && includedDownload.variables.value?.id === photo.id
}

function postOrderRefresh(orderId: string) {
  return apiFetch<Order>(`/api/commerce/orders/${orderId}/refresh/`, { method: 'POST' })
}

function invalidatePurchases() {
  return queryClient.invalidateQueries({ queryKey: ['my-purchases'] })
}

function requestOrderRefresh(orderId: string) {
  refresh.mutate(orderId)
}

function isRefreshingOrder(orderId: string) {
  return refresh.isPending.value && refresh.variables.value === orderId
}

function formatMoney(order: Order) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: order.total_currency,
  }).format(Number(order.total ?? 0))
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

function shortOrderId(id: string) {
  return id.slice(0, ORDER_ID_PREVIEW_LENGTH)
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getSlug() {
  return String(route.params.slug)
}

function getAccessStorageKey() {
  return `gallery-access:${slug.value}`
}

function getGalleryPath() {
  return `/g/${slug.value}`
}

function getExploreActions() {
  return [{ label: 'Explorar galeria', to: galleryPath.value, color: 'neutral' as const }]
}

function getIncludedKey() {
  return ['my-included-photos', slug.value, includedCode.value]
}

function getPurchasesKey() {
  return ['my-purchases', slug.value, page.value]
}

function getRefetchInterval(query: OrdersQuery) {
  const orders = query.state.data?.results ?? []
  for (const order of orders) {
    if (order.status === 'pending') return PENDING_REFETCH_INTERVAL
  }
  return false
}

function getOrdersCountLabel() {
  return data.value?.count === 1 ? 'pedido nesta galeria' : 'pedidos nesta galeria'
}

function getShowPagination() {
  return (data.value?.count ?? 0) > PAGE_SIZE
}

function getShowEmpty() {
  return !included.value?.length && !includedPending.value
}

function getStatusColor(status: Order['status']) {
  if (status === 'paid') return 'success'
  if (status === 'pending') return 'warning'
  return 'neutral'
}

function getPurchaseTypeLabel(order: Order) {
  return order.purchase_type === 'package' ? 'Pacote completo' : 'Compra individual'
}

function getPhotosNoun(count: number) {
  return count === 1 ? 'fotografia' : 'fotografias'
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function handleIncludedDownloadError() {
  errorMessage.value = MESSAGES.downloadFailed
}

function handleRefreshError() {
  errorMessage.value = MESSAGES.refreshFailed
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function refreshAll() {
  void refetch()
  void refetchIncluded()
}

function retryIncluded() {
  refetchIncluded()
}

function retryPurchases() {
  refetch()
}

function fetchIncluded() {
  return apiFetch<PublicPhoto[]>(
    `/api/galleries/public/${encodeURIComponent(slug.value)}/included-photos/`,
    { headers: { [ACCESS_CODE_HEADER]: includedCode.value } },
  )
}

async function refreshPendingOrder(order: Order) {
  try {
    Object.assign(order, await postOrderRefresh(order.id))
  } catch {
    errorMessage.value = MESSAGES.pendingCheckFailed
  }
}

async function fetchPurchases() {
  errorMessage.value = ''

  const result = await apiFetch<OrdersPage>('/api/commerce/orders/mine/', {
    query: { gallery: slug.value, page: page.value },
  })

  for (const order of result.results) {
    if (order.status === 'pending') await refreshPendingOrder(order)
  }

  return result
}
</script>

<template>
  <CGalleryCommerceFrame
    title="Minhas fotos"
    eyebrow="Sua coleção"
    description="Suas fotos incluídas e compras extras, reunidas para baixar os originais."
  >
    <template #actions>
      <UButton
        label="Atualizar"
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        class="rounded-full"
        :loading="isFetching"
        @click="refreshAll"
      />
    </template>
    <UAlert v-if="errorMessage" :title="errorMessage" color="warning" variant="subtle" />
    <USkeleton v-if="includedPending" class="h-32 w-full rounded-2xl" />
    <UAlert
      v-else-if="includedError"
      title="Não foi possível carregar as fotos incluídas."
      color="warning"
      :actions="retryIncludedActions"
    />
    <UCard v-else-if="included?.length" :ui="{ root: 'rounded-2xl shadow-none ring-default/60' }">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-sm font-medium text-highlighted">
            {{ included.length }} fotos incluídas
          </h2>
          <UBadge label="Incluída no trabalho" color="neutral" variant="subtle" />
        </div>
      </template>
      <ul class="divide-y divide-default/60">
        <li
          v-for="photo in included"
          :key="photo.id"
          class="flex flex-wrap items-center justify-between gap-3 py-3"
        >
          <span class="min-w-0 break-words text-sm text-highlighted">{{ photo.name }}</span>
          <UButton
            label="Baixar original"
            icon="i-lucide-download"
            color="neutral"
            variant="outline"
            class="rounded-full"
            :loading="isDownloadingIncluded(photo)"
            @click="downloadIncluded(photo)"
          />
        </li>
      </ul>
    </UCard>
    <USkeleton v-if="isPending" class="h-64 w-full rounded-2xl" />
    <UAlert
      v-else-if="isError"
      title="Não foi possível carregar suas compras."
      color="error"
      :actions="retryPurchasesActions"
    />
    <div v-else-if="data?.results.length" class="space-y-6">
      <p class="text-xs text-muted">{{ data.count }} {{ ordersCountLabel }}</p>
      <UCard
        v-for="order in data.results"
        :key="order.id"
        :ui="{ root: 'rounded-2xl shadow-none ring-default/60' }"
      >
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-3">
                <h2 class="text-sm font-medium text-highlighted" :title="order.id">
                  Pedido <span class="font-mono">{{ shortOrderId(order.id) }}</span>
                </h2>
                <UBadge
                  :label="STATUS_LABELS[order.status]"
                  :color="getStatusColor(order.status)"
                  variant="subtle"
                />
                <UBadge :label="getPurchaseTypeLabel(order)" color="neutral" variant="subtle" />
              </div>
              <p class="text-xs text-muted">
                {{ formatDate(order.created_at) }} · {{ order.photos.length }}
                {{ getPhotosNoun(order.photos.length) }}
              </p>
            </div>
            <p class="text-xl font-medium tracking-tight text-highlighted tabular-nums">
              {{ formatMoney(order) }}
            </p>
          </div>
        </template>
        <div class="space-y-5">
          <p class="text-sm leading-relaxed text-muted">{{ STATUS_DESCRIPTIONS[order.status] }}</p>
          <div v-if="order.status === 'pending'" class="flex flex-wrap gap-3">
            <UButton
              v-if="order.checkout_url"
              label="Continuar pagamento"
              trailing-icon="i-lucide-arrow-up-right"
              :to="order.checkout_url"
              external
              color="neutral"
              class="rounded-full"
            />
            <UButton
              label="Verificar pagamento"
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="outline"
              class="rounded-full"
              :loading="isRefreshingOrder(order.id)"
              :disabled="refresh.isPending.value"
              @click="requestOrderRefresh(order.id)"
            />
          </div>
          <ul class="divide-y divide-default/60">
            <li
              v-for="photo in order.photos"
              :key="photo.id"
              class="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
            >
              <div class="flex min-w-0 items-center gap-3">
                <UIcon name="i-lucide-image" class="size-4 shrink-0 text-muted" />
                <span class="break-words text-sm text-highlighted">{{ photo.name }}</span>
              </div>
              <UButton
                v-if="order.status === 'paid' && photo.download_url"
                label="Baixar original"
                icon="i-lucide-download"
                :href="photo.download_url"
                external
                color="neutral"
                variant="outline"
                class="shrink-0 self-start rounded-full"
              />
            </li>
          </ul>
        </div>
      </UCard>
      <div class="flex justify-center">
        <UPagination
          v-if="showPagination"
          v-model:page="page"
          :total="data.count"
          :items-per-page="PAGE_SIZE"
        />
      </div>
    </div>
    <UEmpty
      v-else-if="showEmpty"
      title="Sua coleção começa aqui"
      description="Escolha suas fotos favoritas na galeria. Seus pedidos e downloads aparecerão neste espaço."
      icon="i-lucide-shopping-bag"
      :actions="exploreActions"
    />
  </CGalleryCommerceFrame>
</template>
