<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import { galleryThemes } from '@/app/features/gallery/constants'
import type { iApiPaginationNumber } from '@/app/shared/types'
import type { GalleryEditorState } from '@/app/features/admin/types/gallery/form'
import type { WatermarkAsset } from '@/app/features/admin/types/gallery/watermark'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const state = defineModel<GalleryEditorState>({ required: true })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const DEFAULT_WATERMARK_ID = 'default'
const THEME_ITEMS = [...galleryThemes]
const DEFAULT_WATERMARK_OPTION = { id: DEFAULT_WATERMARK_ID, name: 'Usar a marca padrão' }

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: watermarks,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: ['watermarks', 'options'],
  queryFn: fetchWatermarks,
})

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const retryActions = [{ label: 'Tentar novamente', onClick: retry }]

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const options = computed(getWatermarkOptions)
const selectedWatermark = computed(getSelectedWatermark)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function selectWatermark(value: string) {
  state.value.watermark_asset = value === DEFAULT_WATERMARK_ID ? null : value
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getWatermarkOptions() {
  return [DEFAULT_WATERMARK_OPTION, ...(watermarks.value?.results ?? [])]
}

function getSelectedWatermark() {
  return state.value.watermark_asset ?? DEFAULT_WATERMARK_ID
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchWatermarks() {
  return apiFetch<iApiPaginationNumber<WatermarkAsset>>('/api/commerce/watermarks/', {
    query: { page_size: 100 },
  })
}

function retry() {
  refetch()
}
</script>

<template>
  <div class="space-y-6">
    <UFormField name="theme" label="Layout das fotos">
      <USelect
        v-model="state.theme"
        :items="THEME_ITEMS"
        label-key="label"
        value-key="value"
        class="w-full"
      />
    </UFormField>
    <USeparator />
    <USwitch
      v-model="state.watermark_enabled"
      label="Aplicar marca d’água"
      description="Protege as prévias exibidas na galeria."
    />
    <template v-if="state.watermark_enabled">
      <UAlert
        v-if="isError"
        title="Não foi possível carregar as marcas."
        color="error"
        :actions="retryActions"
      />
      <UFormField
        v-else
        name="watermark_asset"
        label="Marca d’água"
        description="Escolha uma marca específica ou use a padrão."
      >
        <USelect
          :model-value="selectedWatermark"
          :items="options"
          label-key="name"
          value-key="id"
          :loading="isPending"
          class="w-full"
          @update:model-value="selectWatermark"
        />
      </UFormField>
      <p class="text-xs text-muted">
        Para atualizar fotos existentes, reaplique a marca pelo menu da galeria.
      </p>
    </template>
  </div>
</template>
