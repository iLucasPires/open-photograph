<script setup lang="ts">
import type { AdminGalleryTag } from '@/app/features/admin/types/gallery/tag'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import type { iApiPaginationNumber } from '@/app/shared/types'
import AdminGalleryTagFormModal from '../components/gallery/tags/admin-gallery-tag-form-modal.vue'
import type { TableColumn } from '@nuxt/ui'
import { adminTableUi } from '../constants/table'
import type { GalleryTag } from '@/app/features/gallery/types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'AdminTagsPage' })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const columns: TableColumn<AdminGalleryTag>[] = [
  { accessorKey: 'title', header: 'Nome' },
  { accessorKey: 'gallery_count', header: 'Uso em galerias' },
  { id: 'actions', header: 'Ações' },
]
const pageSize = 12
const tagsKey = ['gallery-tags']

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const overlay = useOverlay()
const formModal = overlay.create(AdminGalleryTagFormModal)
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const page = ref(1)
const errorMessage = ref('')
const search = ref('')
const deletingTag = ref<GalleryTag>()

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: tags,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: tagsKey,
  queryFn: fetchTags,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const filteredTags = computed(getFilteredTags)
const pagedTags = computed(getPagedTags)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const remove = useMutation({
  mutationFn: submitRemove,
  onMutate: handleRemoveMutate,
  onSuccess,
  onError,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const busy = computed(getBusy)

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(search, () => {
  page.value = 1
})
watch(
  () => filteredTags.value.length,
  (total) => {
    page.value = Math.min(page.value, Math.max(1, Math.ceil(total / pageSize)))
  },
)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function onError(error: Error) {
  const response = error as { data?: { errors?: { detail: string }[] } }
  errorMessage.value =
    response.data?.errors?.map((item) => item.detail).join(' ') ||
    'Não foi possível salvar a alteração. Tente novamente.'
}

async function onSuccess() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: tagsKey }),
    queryClient.invalidateQueries({ queryKey: ['galleries'] }),
  ])
}

function createTag() {
  formModal.open({ tag: undefined, tags: tags.value ?? [] })
}

function editTag(tag: GalleryTag) {
  deletingTag.value = undefined
  errorMessage.value = ''
  formModal.open({ tag, tags: tags.value ?? [] })
}

function confirmDelete(tag: GalleryTag) {
  deletingTag.value = tag
  errorMessage.value = ''
}

async function deleteTag() {
  if (!deletingTag.value) return
  try {
    const id = deletingTag.value.id
    await remove.mutateAsync(id)
    deletingTag.value = undefined
  } catch {
    // Keep the confirmation visible so the user can retry.
  }
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getBusy() {
  return remove.isPending.value
}

function getFilteredTags() {
  return (tags.value ?? []).filter((tag) =>
    tag.title.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase()),
  )
}

function getPagedTags() {
  return filteredTags.value.slice((page.value - 1) * pageSize, page.value * pageSize)
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitRemove(id: string) {
  return apiFetch(`/api/tags/${id}/`, { method: 'DELETE' })
}

function handleRemoveMutate() {
  errorMessage.value = ''
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

async function fetchTags() {
  const tags: AdminGalleryTag[] = []
  let page = 1
  while (true) {
    const response = await apiFetch<iApiPaginationNumber<AdminGalleryTag>>('/api/tags/', {
      query: { page, page_size: 1000 },
    })
    tags.push(...response.results)
    if (!response.next) return tags
    page += 1
  }
}
</script>

<template>
  <CAdminPageFrame
    title="Tags"
    description="Organize as tags e acompanhe em quantas galerias cada uma é usada."
    :eyebrow="`Organização · ${tags?.length ?? 0} tags`"
  >
    <template #actions>
      <UButton
        label="Nova tag"
        icon="i-lucide-plus"
        color="neutral"
        class="rounded-full px-5"
        size="md"
        :disabled="isPending || isError || busy"
        @click="createTag"
      />
    </template>
    <div class="space-y-5">
      <UAlert v-if="errorMessage" :title="errorMessage" color="error" variant="subtle" />
      <UAlert
        v-if="deletingTag"
        :title="`Apagar a tag “${deletingTag.title}”?`"
        description="A tag será removida de todas as galerias. As galerias e fotos serão mantidas."
        color="warning"
        variant="subtle"
      >
        <template #actions>
          <UButton
            label="Cancelar"
            color="neutral"
            variant="ghost"
            :disabled="busy"
            @click="deletingTag = undefined"
          />
          <UButton
            label="Apagar tag"
            color="error"
            :loading="remove.isPending.value"
            :disabled="busy"
            @click="deleteTag"
          />
        </template>
      </UAlert>
      <CAdminListFrame
        v-model:page="page"
        title="Todas as tags"
        :summary="`${filteredTags.length} tags`"
        :total="filteredTags.length"
        :page-size="pageSize"
      >
        <template #toolbar>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar tags"
            aria-label="Buscar tags"
            class="w-full sm:w-64"
          />
        </template>
        <UAlert
          v-if="isError"
          title="Não foi possível carregar as tags"
          color="error"
          variant="subtle"
          :actions="[{ label: 'Tentar novamente', onClick: () => refetch() }]"
        />
        <UTable v-else :data="pagedTags" :columns="columns" :loading="isPending" :ui="adminTableUi">
          <template #title-cell="{ row }">
            <span class="font-medium text-highlighted">{{ row.original.title }}</span>
          </template>
          <template #gallery_count-cell="{ row }">
            {{ row.original.gallery_count }}
            {{ row.original.gallery_count === 1 ? 'galeria' : 'galerias' }}
          </template>
          <template #actions-cell="{ row }">
            <div class="flex justify-end gap-1">
              <UTooltip :text="`Editar ${row.original.title}`">
                <UButton
                  icon="i-lucide-pencil"
                  :aria-label="`Editar ${row.original.title}`"
                  color="neutral"
                  variant="ghost"
                  :disabled="busy"
                  @click="editTag(row.original)"
                />
              </UTooltip>
              <UTooltip :text="`Apagar ${row.original.title}`">
                <UButton
                  icon="i-lucide-trash-2"
                  :aria-label="`Apagar ${row.original.title}`"
                  color="neutral"
                  variant="ghost"
                  :disabled="busy"
                  @click="confirmDelete(row.original)"
                />
              </UTooltip>
            </div>
          </template>
          <template #empty>
            <UEmpty
              icon="i-lucide-tags"
              title="Nenhuma tag encontrada"
              :description="
                search
                  ? 'Tente buscar por outro nome.'
                  : 'Crie uma tag para organizar suas galerias.'
              "
            />
          </template>
        </UTable>
      </CAdminListFrame>
    </div>
  </CAdminPageFrame>
</template>
