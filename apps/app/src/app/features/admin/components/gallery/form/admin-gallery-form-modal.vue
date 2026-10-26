<script setup lang="ts">
import type { GalleryTag, ApiErrorItem, ApiError } from '@/app/features/admin/types/gallery/editor'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import { createGalleryEditorSchema } from '../../../schemas/gallery/form'
import type { GalleryEditorState } from '@/app/features/admin/types/gallery/form'
import { galleryPayload } from '../../../utils/gallery/form'
import { generateSimpleSlug } from '@/app/shared/utils'
import type { FormErrorEvent } from '@nuxt/ui'
import type { Gallery } from '@/app/features/gallery/types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{ gallery?: Gallery }>()
const emit = defineEmits<{ close: [saved: boolean] }>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const DEFAULT_SECTION = 'details'
const sections = [
  {
    value: 'details',
    label: 'Informações',
    icon: 'i-lucide-image',
    description: 'Nome, organização e origem das fotos.',
  },
  {
    value: 'access',
    label: 'Acesso',
    icon: 'i-lucide-users',
    description: 'Publicação, interações e permissões dos clientes.',
  },
  {
    value: 'appearance',
    label: 'Aparência',
    icon: 'i-lucide-palette',
    description: 'Layout da galeria e proteção das prévias.',
  },
  {
    value: 'sales',
    label: 'Entrega e extras',
    icon: 'i-lucide-shopping-bag',
    description: 'Fotos incluídas no trabalho e venda opcional de extras.',
  },
]
// Campos que pertencem a cada aba (o que não estiver aqui cai em "details")
const SECTION_FIELDS: Record<string, string[]> = {
  access: [
    'access_type',
    'access_code',
    'is_published',
    'allow_downloads',
    'allow_likes',
    'allow_comments',
    'allow_selection',
  ],
  appearance: ['theme', 'watermark_enabled', 'watermark_asset'],
  sales: [
    'clients',
    'included_photo_mode',
    'included_photo_limit',
    'enable_sales',
    'allow_individual_purchase',
    'gallery_price',
    'gallery_price_currency',
    'default_photo_price',
  ],
}
const schema = createGalleryEditorSchema(() => props.gallery?.access_type)

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const toast = useToast()
const formId = useId()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const slugEdited = ref(!!props.gallery)
const errorMessage = ref('')
const section = ref(DEFAULT_SECTION)
const state = reactive<GalleryEditorState>(buildInitialState())

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const activeSection = computed(getActiveSection)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: saveGallery,
  onMutate: handleSaveStart,
  onSuccess: handleSaveSuccess,
  onError: handleSaveError,
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(() => state.name, syncSlugWithName)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function toTagId(tag: GalleryTag) {
  return typeof tag === 'string' ? tag : tag.id
}

function buildInitialState(): GalleryEditorState {
  const gallery = props.gallery

  return {
    name: gallery?.name ?? '',
    slug: gallery?.slug ?? '',
    description: gallery?.description ?? '',
    theme: gallery?.theme ?? 'masonry',
    access_type: gallery?.access_type ?? 'unlisted',
    access_code: '',
    clients: [...(gallery?.clients ?? [])],
    tags: (gallery?.tags ?? []).map(toTagId),
    is_published: gallery?.is_published ?? false,
    allow_downloads: gallery?.allow_downloads ?? true,
    allow_likes: gallery?.allow_likes ?? false,
    allow_comments: gallery?.allow_comments ?? false,
    allow_selection: gallery?.allow_selection ?? false,
    source_folder_id: gallery?.source_folder_id ?? '',
    watermark_enabled: gallery?.watermark_enabled ?? false,
    watermark_asset: gallery?.watermark_asset ?? null,
    enable_sales: gallery?.enable_sales ?? false,
    included_photo_mode: gallery?.included_photo_mode ?? 'none',
    included_photo_limit: gallery?.included_photo_limit ?? 0,
    allow_individual_purchase: gallery?.allow_individual_purchase ?? false,
    gallery_price: gallery?.gallery_price ? Number(gallery.gallery_price) : undefined,
    default_photo_price: gallery?.default_photo_price
      ? Number(gallery.default_photo_price)
      : undefined,
    gallery_price_currency: (gallery?.gallery_price_currency ??
      'BRL') as GalleryEditorState['gallery_price_currency'],
  }
}

function syncSlugWithName(name: string) {
  if (!slugEdited.value) state.slug = generateSimpleSlug(name)
}

function buildRequestBody() {
  return {
    ...galleryPayload(state),
    access_code: state.access_type === 'private' ? state.access_code || undefined : undefined,
    tags: state.tags,
    is_published: state.is_published,
    watermark_enabled: state.watermark_enabled,
    watermark_asset: state.watermark_asset,
  }
}

function saveGallery() {
  const url = props.gallery ? `/api/galleries/${props.gallery.id}/` : '/api/galleries/'

  return apiFetch<Gallery>(url, {
    method: props.gallery ? 'PATCH' : 'POST',
    body: buildRequestBody(),
  })
}

function findSectionByField(field: string) {
  for (const [value, fields] of Object.entries(SECTION_FIELDS)) {
    if (fields.includes(field)) return value
  }
  return DEFAULT_SECTION
}

function showInvalidSection(event: FormErrorEvent) {
  const field = event.errors[0]?.name ?? ''
  section.value = findSectionByField(field)
}

function markSlugAsEdited() {
  slugEdited.value = true
}

function cancel() {
  emit('close', false)
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getErrorDetail(item: ApiErrorItem) {
  return item.detail
}

function getActiveSection() {
  for (const item of sections) {
    if (item.value === section.value) return item
  }
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function handleSaveStart() {
  errorMessage.value = ''
}

async function handleSaveSuccess() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['galleries'] }),
    queryClient.invalidateQueries({ queryKey: ['gallery-tags'] }),
  ])
  toast.add({ title: props.gallery ? 'Galeria atualizada' : 'Galeria criada', color: 'success' })
  emit('close', true)
}

function handleSaveError(error: unknown) {
  const details = (error as ApiError).data?.errors?.map(getErrorDetail).join(' ')
  errorMessage.value = details || 'Não foi possível salvar a galeria.'
}
</script>

<template>
  <UModal
    :title="gallery ? 'Editar galeria' : 'Nova galeria'"
    description="Organize as fotos e escolha como compartilhar com seus clientes."
    :dismissible="!save.isPending.value"
    :close="{
      disabled: save.isPending.value,
    }"
    :ui="{
      content: 'max-w-3xl',
      body: 'space-y-6',
      footer: 'justify-between',
    }"
  >
    <template #body>
      <UTabs
        v-model="section"
        color="neutral"
        :items="sections"
        :content="false"
        :disabled="save.isPending.value"
        :ui="{
          list: 'w-full',
          trigger: 'flex-1',
        }"
      />
      <UAlert v-if="errorMessage" :title="errorMessage" color="error" variant="subtle" />
      <p class="text-sm text-muted">{{ activeSection?.description }}</p>
      <UForm
        class="min-h-64"
        :id="formId"
        :schema="schema"
        :state="state"
        :disabled="save.isPending.value"
        @submit="save.mutate()"
        @error="showInvalidSection"
      >
        <CAdminGalleryDetailsFields
          v-show="section === 'details'"
          v-model="state"
          @edit-slug="markSlugAsEdited"
        />
        <CAdminGalleryAccessFields
          v-show="section === 'access'"
          v-model="state"
          :editing="!!gallery"
        />
        <CAdminGalleryAppearanceFields v-show="section === 'appearance'" v-model="state" />
        <CAdminGallerySalesFields v-show="section === 'sales'" v-model="state" />
      </UForm>
    </template>
    <template #footer>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        :disabled="save.isPending.value"
        @click="cancel"
      />
      <UButton
        type="submit"
        icon="i-lucide-check"
        :form="formId"
        :label="gallery ? 'Salvar alterações' : 'Criar galeria'"
        :loading="save.isPending.value"
      />
    </template>
  </UModal>
</template>
