<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import CAdminGalleryFormModal from '../../components/gallery/form/admin-gallery-form-modal.vue'
import type { TableColumn } from '@nuxt/ui'
import { adminTableUi } from '../../constants/table'
import type { Gallery } from '@/app/features/gallery/types'
import type { iApiPaginationNumber } from '@/app/shared/types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'AdminGalleriesPage' })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const columns: TableColumn<Gallery>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'access_type', header: 'Acesso' },
  { accessorKey: 'is_published', header: 'Status' },
  { accessorKey: 'updated_at', header: 'Atualizada' },
  { id: 'actions', header: 'Ações' },
]
const accessLabels = {
  public: 'Pública',
  unlisted: 'Não listada',
  private: 'Privada',
}
const accessIcons = {
  public: 'i-lucide-globe-2',
  unlisted: 'i-lucide-link',
  private: 'i-lucide-lock-keyhole',
}
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' })

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const overlay = useOverlay()
const router = useRouter()
const modal = overlay.create(CAdminGalleryFormModal)

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const page = ref(1)
const search = ref('')
const debouncedSearch = refDebounced(search, 300)

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(debouncedSearch, () => {
  page.value = 1
})

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data, isPending, isError, refetch } = useQuery({
  queryKey: computed(() => ['galleries', 'list', page.value, debouncedSearch.value]),
  queryFn: getGalleries,
})

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function newGallery() {
  modal.open({ gallery: undefined })
}

function openPhotos(gallery: Gallery) {
  void router.push({ name: 'admin.galleries.photos', params: { galleryId: gallery.id } })
}

function editGallery(gallery: Gallery) {
  modal.open({ gallery })
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getGalleries() {
  return apiFetch<iApiPaginationNumber<Gallery>>('/api/galleries/', {
    query: {
      page: page.value,
      page_size: 12,
      search: debouncedSearch.value,
    },
  })
}
</script>

<template>
  <CAdminPageFrame
    title="Galerias"
    description="Organize seus ensaios e compartilhe cada história."
    :eyebrow="`Coleções · ${data?.count ?? 0} galerias`"
  >
    <template #actions>
      <UButton
        label="Gerenciar tags"
        icon="i-lucide-tags"
        color="neutral"
        variant="outline"
        class="rounded-full px-5"
        size="md"
        :to="{ name: 'admin.tags' }"
      />
      <UButton
        @click="newGallery"
        label="Nova galeria"
        icon="i-lucide-plus"
        color="neutral"
        class="rounded-full px-5"
        size="md"
      />
    </template>

    <CAdminListFrame
      v-model:page="page"
      title="Todas as galerias"
      :summary="`${data?.count ?? 0} galerias`"
      :total="data?.count ?? 0"
      :page-size="12"
    >
      <template #toolbar>
        <UInput
          v-model="search"
          icon="i-lucide-search"
          class="w-full sm:w-64"
          color="neutral"
          variant="subtle"
          placeholder="Buscar galerias"
          aria-label="Buscar galerias"
        />
      </template>

      <UAlert
        v-if="isError"
        title="Não foi possível carregar as galerias"
        color="error"
        variant="subtle"
        :actions="[{ label: 'Tentar novamente', onClick: () => refetch() }]"
      />
      <UTable
        v-else
        :data="data?.results ?? []"
        :columns="columns"
        :loading="isPending"
        class="w-full"
        :ui="adminTableUi"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar icon="i-lucide-images" color="neutral" size="sm" class="rounded-md" />
            <div class="min-w-0">
              <UButton
                :label="row.original.name"
                color="neutral"
                variant="link"
                class="p-0 font-medium text-highlighted"
                @click="openPhotos(row.original)"
              />
              <p class="max-w-64 truncate text-xs text-muted">/g/{{ row.original.slug }}</p>
            </div>
          </div>
        </template>
        <template #access_type-cell="{ row }">
          <UBadge
            :label="accessLabels[row.original.access_type]"
            :icon="accessIcons[row.original.access_type]"
            color="neutral"
            variant="subtle"
          />
        </template>
        <template #updated_at-cell="{ row }">
          <span class="text-xs text-muted">{{
            dateFormatter.format(new Date(row.original.updated_at))
          }}</span>
        </template>
        <template #is_published-cell="{ row }">
          <UBadge
            :label="row.original.is_published ? 'Publicada' : 'Rascunho'"
            :color="row.original.is_published ? 'success' : 'neutral'"
            variant="subtle"
          />
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              label="Editar"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="editGallery(row.original)"
            />
            <UButton
              label="Fotos"
              icon="i-lucide-images"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="openPhotos(row.original)"
            />
          </div>
        </template>
        <template #empty>
          <UEmpty
            icon="i-lucide-images"
            title="Nenhuma galeria encontrada"
            :description="
              search
                ? 'Tente buscar por outro nome.'
                : 'Crie uma galeria para começar a organizar suas fotos.'
            "
            class="py-16"
          />
        </template>
      </UTable>
    </CAdminListFrame>
  </CAdminPageFrame>
</template>
