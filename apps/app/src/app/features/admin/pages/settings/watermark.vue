<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { adminTableUi } from '../../constants/table'
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import type { iApiPaginationNumber } from '@/app/shared/types'
import type { WatermarkAsset } from '@/app/features/admin/types/gallery/watermark'
import GalleryWatermarkModal from '../../components/gallery/watermark/admin-gallery-watermark-modal.vue'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'AdminWatermarksPage' })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const PAGE_SIZE = 12
const STYLE_LABELS: Record<WatermarkAsset['style'], string> = {
  text_diagonal: 'Texto diagonal',
  image_overlay: 'Logo',
  combined: 'Texto e logo',
}
const columns: TableColumn<WatermarkAsset>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'style', header: 'Estilo' },
  { accessorKey: 'is_default', header: 'Uso' },
  { id: 'actions', header: 'Ações' },
]

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const overlay = useOverlay()
const modal = overlay.create(GalleryWatermarkModal)

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const page = ref(1)

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data, isPending, isError, refetch } = useQuery({
  queryKey: computed(getListKey),
  queryFn: fetchWatermarks,
})

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const retryActions = [{ label: 'Tentar novamente', onClick: retry }]

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const total = computed(getTotal)
const summary = computed(getSummary)
const rows = computed(getRows)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function openCreateModal() {
  modal.open({ asset: undefined })
}

function openEditModal(asset: WatermarkAsset) {
  modal.open({ asset })
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getListKey() {
  return ['watermarks', 'list', page.value]
}

function getTotal() {
  return data.value?.count ?? 0
}

function getSummary() {
  return `${total.value} marcas d'água`
}

function getRows() {
  return data.value?.results ?? []
}

function getUsageLabel(asset: WatermarkAsset) {
  return asset.is_default ? 'Padrão' : 'Por galeria'
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchWatermarks() {
  return apiFetch<iApiPaginationNumber<WatermarkAsset>>('/api/commerce/watermarks/', {
    query: { page: page.value, page_size: PAGE_SIZE },
  })
}

function retry() {
  refetch()
}
</script>

<template>
  <CAdminPageFrame
    title="Marcas d’água"
    eyebrow="Seu estúdio"
    description="Crie suas assinaturas e escolha a marca ideal para cada galeria."
  >
    <template #actions>
      <UButton
        label="Nova marca d’água"
        icon="i-lucide-plus"
        color="neutral"
        class="rounded-full px-5"
        size="md"
        @click="openCreateModal"
      />
    </template>
    <UAlert
      v-if="isError"
      title="Não foi possível carregar as marcas d’água."
      color="error"
      :actions="retryActions"
    />
    <CAdminListFrame
      v-else
      v-model:page="page"
      title="Todas as marcas d'água"
      :summary="summary"
      :total="total"
      :page-size="PAGE_SIZE"
    >
      <UTable
        :data="rows"
        :columns="columns"
        :loading="isPending"
        :ui="adminTableUi"
        class="w-full"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar
              :src="row.original.logo ?? undefined"
              icon="i-lucide-stamp"
              size="sm"
              class="rounded-md"
            />
            <UButton
              :label="row.original.name"
              color="neutral"
              variant="link"
              class="p-0 font-medium text-highlighted"
              @click="openEditModal(row.original)"
            />
          </div>
        </template>
        <template #style-cell="{ row }">{{ STYLE_LABELS[row.original.style] }}</template>
        <template #is_default-cell="{ row }">
          <UBadge :label="getUsageLabel(row.original)" color="neutral" variant="subtle" />
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              label="Editar"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="openEditModal(row.original)"
            />
          </div>
        </template>
        <template #empty>
          <UEmpty
            title="Nenhuma marca d’água"
            description="Crie sua primeira assinatura para usar nas galerias."
            icon="i-lucide-stamp"
            class="py-16"
          />
        </template>
      </UTable>
    </CAdminListFrame>
  </CAdminPageFrame>
</template>
