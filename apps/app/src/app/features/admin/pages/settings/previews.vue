<script setup lang="ts">
import type { PreviewSettings } from '@/app/features/admin/types/gallery/preview'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'AdminPreviewSettingsPage' })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const SETTINGS_URL = '/api/gallery-preview-settings/'
const SETTINGS_KEY = ['preview-settings']
const DEFAULT_QUALITY = 85
const DEFAULT_MAX_SIZE = 1920
const QUALITY_MIN = 40
const QUALITY_MAX = 100
const MAX_SIZE_MIN = 800
const MAX_SIZE_MAX = 4096
const MESSAGES = {
  saved: 'Qualidade das prévias salva',
  saveFailed: 'Não foi possível salvar a configuração.',
  regenerateQueued: 'Reprocessamento enfileirado',
  regenerateDescription: 'As fotos serão atualizadas em segundo plano pelo worker.',
  regenerateFailed: 'Não foi possível enfileirar o reprocessamento.',
}

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const state = reactive<PreviewSettings>({ quality: DEFAULT_QUALITY, max_size: DEFAULT_MAX_SIZE })

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data, isPending, isError, refetch } = useQuery({
  queryKey: SETTINGS_KEY,
  queryFn: fetchSettings,
})

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const retryActions = [{ label: 'Tentar novamente', onClick: retry }]

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const changed = computed(getChanged)
const valid = computed(getValid)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: patchSettings,
  onSuccess: handleSaveSuccess,
  onError: handleSaveError,
})
const regenerate = useMutation({
  mutationFn: postRegenerate,
  onSuccess: handleRegenerateSuccess,
  onError: handleRegenerateError,
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(data, syncStateWithData, { immediate: true })

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function syncStateWithData(value: PreviewSettings | undefined) {
  if (value) Object.assign(state, value)
}

function isIntegerInRange(value: number, min: number, max: number) {
  return Number.isInteger(value) && value >= min && value <= max
}

function patchSettings() {
  return apiFetch(SETTINGS_URL, { method: 'PATCH', body: state })
}

function postRegenerate() {
  return apiFetch(SETTINGS_URL, { method: 'POST' })
}

function requestRegenerate() {
  regenerate.mutate()
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getChanged() {
  return state.quality !== data.value?.quality || state.max_size !== data.value?.max_size
}

function getValid() {
  return (
    isIntegerInRange(state.quality, QUALITY_MIN, QUALITY_MAX) &&
    isIntegerInRange(state.max_size, MAX_SIZE_MIN, MAX_SIZE_MAX)
  )
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function handleSaveSuccess() {
  await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY })
  toast.add({ title: MESSAGES.saved, color: 'success' })
}

function handleSaveError() {
  toast.add({ title: MESSAGES.saveFailed, color: 'error' })
}

function submit() {
  if (!valid.value) return
  save.mutate()
}

function handleRegenerateSuccess() {
  toast.add({
    title: MESSAGES.regenerateQueued,
    description: MESSAGES.regenerateDescription,
    color: 'success',
  })
}

function handleRegenerateError() {
  toast.add({ title: MESSAGES.regenerateFailed, color: 'error' })
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchSettings() {
  return apiFetch<PreviewSettings>(SETTINGS_URL)
}

function retry() {
  refetch()
}
</script>

<template>
  <CAdminPageFrame
    title="Qualidade das prévias"
    eyebrow="Configurações"
    description="Equilibre definição e carregamento das imagens exibidas nas galerias."
  >
    <UAlert
      v-if="isError"
      title="Não foi possível carregar as configurações."
      color="error"
      :actions="retryActions"
    />
    <USkeleton v-else-if="isPending" class="h-80 rounded-2xl" />
    <div v-else class="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
      <div class="space-y-8">
        <section class="space-y-5">
          <h2 class="text-sm font-medium text-highlighted">Ajustes da imagem</h2>
          <form class="space-y-6" @submit.prevent="submit">
            <UFormField
              label="Qualidade WebP"
              description="De 40 a 100. Valores maiores preservam mais detalhes e aumentam o arquivo. O padrão é 85."
            >
              <UInputNumber
                v-model="state.quality"
                :min="QUALITY_MIN"
                :max="QUALITY_MAX"
                :step="1"
                :precision="0"
                :disabled="save.isPending.value"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Lado máximo da prévia (pixels)"
              description="De 800 a 4096 px. Mantém a proporção e não amplia imagens pequenas. O padrão é 1920 px."
            >
              <UInputNumber
                v-model="state.max_size"
                :min="MAX_SIZE_MIN"
                :max="MAX_SIZE_MAX"
                :step="1"
                :precision="0"
                :disabled="save.isPending.value"
                class="w-full"
              />
            </UFormField>
            <UButton
              type="submit"
              label="Salvar configuração"
              color="neutral"
              class="rounded-full"
              :disabled="!valid || !changed"
              :loading="save.isPending.value"
            />
          </form>
        </section>
        <section class="space-y-4 border-t border-default/60 pt-6">
          <h2 class="text-sm font-medium text-highlighted">Fotos já publicadas</h2>
          <p class="text-sm leading-relaxed text-muted">
            O padrão vale para os próximos processamentos. A qualidade WebP também se aplica às
            miniaturas e marcas d’água. As miniaturas mantêm o lado máximo de 400 px.
          </p>
          <p class="text-sm leading-relaxed text-muted">
            Os JPEGs originais entregues ao cliente permanecem sem redução de tamanho ou qualidade.
          </p>
          <USeparator />
          <p class="text-sm leading-relaxed text-muted">
            Para atualizar as prévias já existentes, salve primeiro e inicie o reprocessamento. Ele
            relê os originais e depende do worker e do acesso à origem dos arquivos.
          </p>
          <UButton
            label="Aplicar às fotos existentes"
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            class="rounded-full"
            :disabled="changed || save.isPending.value"
            :loading="regenerate.isPending.value"
            @click="requestRegenerate"
          />
        </section>
      </div>
      <CAdminImagePreview
        :quality="state.quality"
        :max-size="state.max_size"
        class="min-w-0 lg:sticky lg:top-6"
      />
    </div>
  </CAdminPageFrame>
</template>
