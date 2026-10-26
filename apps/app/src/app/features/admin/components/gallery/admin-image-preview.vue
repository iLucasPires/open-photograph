<script setup lang="ts">
import type {
  PreviewResult,
  PreviewVariables,
  RenderedPreview,
} from '@/app/features/admin/types/gallery/preview'
import { useMutation } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { WatermarkFormState } from '@/app/features/admin/types/gallery/watermark'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{
  watermark?: WatermarkFormState
  logo?: File | null
  assetId?: string | null
  removeLogo?: boolean
  quality?: number
  maxSize?: number
}>()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const sample = ref<File | null>(null)
const result = shallowRef<PreviewResult>()
const error = ref('')
const actualSize = ref(false)
const revision = ref(0)
let controller: AbortController | undefined
let disposed = false

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const fileSize = computed(getFileSize)
const stale = computed(getStale)

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(
  () => [
    sample.value,
    props.watermark,
    props.logo,
    props.assetId,
    props.removeLogo,
    props.quality,
    props.maxSize,
  ],
  () => {
    revision.value++
    controller?.abort()
    error.value = ''
  },
  { deep: true, flush: 'sync' },
)
watch(sample, () => {
  result.value = undefined
  error.value = ''
})

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const preview = useMutation({
  mutationFn: submitPreview,
  onMutate: handlePreviewMutate,
  onSuccess: handlePreviewSuccess,
  onError: handlePreviewError,
})

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------
watchDebounced(revision, generatePreview, { debounce: 600 })

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(
  () => result.value?.image,
  (_current, previous) => {
    if (previous) URL.revokeObjectURL(previous)
  },
)
onBeforeUnmount(() => {
  disposed = true
  controller?.abort()
  if (result.value) URL.revokeObjectURL(result.value.image)
})

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function generatePreview() {
  if (!sample.value || disposed) return
  controller?.abort()
  controller = new AbortController()
  preview.mutate({ renderedRevision: revision.value, signal: controller.signal })
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getFileSize() {
  return result.value ? `${(result.value.bytes / 1024).toFixed(1)} KB` : ''
}

function getStale() {
  return !!result.value && result.value.revision !== revision.value
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function submitPreview({
  renderedRevision,
  signal,
}: {
  renderedRevision: number
  signal: AbortSignal
}) {
  if (!sample.value) throw new Error('Escolha uma foto para testar.')
  const body = new FormData()
  body.append('image', sample.value)
  if (props.watermark) body.append('watermark', JSON.stringify(props.watermark))
  if (props.logo) body.append('logo', props.logo)
  if (props.assetId) body.append('asset_id', props.assetId)
  body.append('remove_logo', String(props.removeLogo ?? false))
  if (props.quality !== undefined) body.append('quality', String(props.quality))
  if (props.maxSize !== undefined) body.append('max_size', String(props.maxSize))
  const response = await apiFetch.raw<Blob, 'blob'>('/api/gallery-preview-settings/render/', {
    method: 'POST',
    body,
    responseType: 'blob',
    signal,
  })
  if (!response._data) throw new Error('Resposta sem imagem.')
  return {
    blob: response._data,
    width: Number(response.headers.get('X-Image-Width')),
    height: Number(response.headers.get('X-Image-Height')),
    revision: renderedRevision,
  }
}

function handlePreviewMutate() {
  error.value = ''
}

function handlePreviewSuccess(rendered: RenderedPreview) {
  if (disposed || rendered.revision !== revision.value) return
  result.value = {
    image: URL.createObjectURL(rendered.blob),
    width: rendered.width,
    height: rendered.height,
    bytes: rendered.blob.size,
    revision: rendered.revision,
  }
}

function handlePreviewError(_error: Error, variables: PreviewVariables) {
  if (!disposed && !variables.signal.aborted && variables.renderedRevision === revision.value)
    error.value =
      'Não foi possível gerar a prévia. Verifique a foto e os parâmetros e tente novamente.'
}
</script>

<template>
  <section class="flex min-w-0 flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-sm font-medium text-highlighted">Prévia</h2>
      <span
        v-if="preview.isPending.value"
        role="status"
        class="flex items-center gap-2 text-xs text-muted"
      >
        <UIcon name="i-lucide-loader-circle" class="size-3.5 animate-spin" /> Atualizando
      </span>
      <span v-else-if="stale" class="text-xs text-muted">Alterações pendentes</span>
    </div>
    <UFileUpload
      v-model="sample"
      accept="image/jpeg,image/png,image/webp"
      :preview="false"
      :interactive="false"
    >
      <template #default="{ open }">
        <div v-if="sample" class="flex min-w-0 items-center justify-between gap-3">
          <span class="truncate text-xs text-muted">{{ sample.name }}</span>
          <UButton
            label="Trocar foto"
            icon="i-lucide-image-plus"
            color="neutral"
            variant="outline"
            class="shrink-0 rounded-full"
            @click="open()"
          />
        </div>
        <div
          v-else
          class="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl bg-muted/60 px-6 py-12 text-center"
        >
          <UIcon name="i-lucide-image" class="size-8 text-dimmed" />
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Veja o resultado na sua foto</p>
            <p class="text-xs text-muted">JPEG, PNG ou WebP · até 20 MB e 24 MP</p>
          </div>
          <UButton
            label="Escolher foto"
            icon="i-lucide-plus"
            color="neutral"
            variant="outline"
            class="rounded-full"
            @click="open()"
          />
        </div>
      </template>
    </UFileUpload>
    <UAlert
      v-if="error"
      :title="error"
      color="neutral"
      variant="subtle"
      :actions="[{ label: 'Tentar novamente', onClick: generatePreview }]"
    />
    <USkeleton v-if="sample && !result && !error" class="min-h-[320px] w-full rounded-xl" />
    <template v-if="result">
      <div
        class="max-h-[55dvh] min-h-[280px] overflow-auto rounded-xl bg-muted/60"
        :class="actualSize ? '' : 'flex items-center justify-center'"
        :aria-busy="preview.isPending.value"
      >
        <img
          :src="result.image"
          alt="Resultado da última prévia gerada"
          :width="result.width"
          :height="result.height"
          :class="actualSize ? 'max-w-none' : 'max-h-[55dvh] max-w-full object-contain'"
          :style="actualSize ? { width: `${result.width}px` } : undefined"
        />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span class="tabular-nums"
          >{{ result.width }} × {{ result.height }} px · {{ fileSize }}</span
        >
        <USwitch v-model="actualSize" label="Ver em 100%" size="sm" />
      </div>
    </template>
    <p class="text-[11px] leading-relaxed text-dimmed">
      Foto usada apenas neste teste. A prévia não salva os ajustes.
    </p>
  </section>
</template>
