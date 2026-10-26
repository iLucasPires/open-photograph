<script setup lang="ts">
import type { DriveSummary } from '@/app/features/admin/types/gallery/drive'
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import { calculateDiscountedTotal, calculateUnitPriceFromTotal } from '@/app/shared/utils'
import type { GalleryEditorState } from '@/app/features/admin/types/gallery/form'
import type { Client, ClientList } from '@/app/features/admin/types/client/index'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const state = defineModel<GalleryEditorState>({ required: true })

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(
  () => [state.value.enable_sales, state.value.included_photo_mode],
  () => {
    if (state.value.included_photo_mode === 'all') {
      state.value.enable_sales = false
      state.value.allow_individual_purchase = false
    }
    if (state.value.enable_sales && state.value.included_photo_mode === 'client')
      state.value.allow_individual_purchase = true
  },
  { immediate: true },
)

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const CURRENCIES = ['BRL', 'USD', 'EUR']
const JPEG_MIME_TYPES = ['image/jpeg', 'image/jpg']

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const count = ref<number>()
const countEdited = ref(false)
const discount = ref(20)
const packageEdited = ref(state.value.gallery_price != null)
const individualEdited = ref(state.value.default_photo_price != null)

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const folderId = computed(getFolderId)
const queryKey = computed(getQueryKey)

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: clients,
  isPending: clientsPending,
  isError: clientsError,
  refetch: refetchClients,
} = useQuery({
  queryKey: ['clients', 'gallery-options'],
  enabled: computed(() => state.value.included_photo_mode === 'client'),
  queryFn: fetchClients,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const queryEnabled = computed(getQueryEnabled)

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: summary,
  isFetching,
  isError,
} = useQuery({
  queryKey,
  queryFn: fetchFolderSummary,
  enabled: queryEnabled,
  retry: false,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const packageSuggestion = computed(getPackageSuggestion)
const individualSuggestion = computed(getIndividualSuggestion)
const countDescription = computed(getCountDescription)
const priceFormatOptions = computed(getPriceFormatOptions)
const showRecalculate = computed(shouldShowRecalculate)

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(folderId, resetCount)
watch(summary, syncCountWithSummary, { immediate: true })
watch([packageSuggestion, individualSuggestion], applySuggestions)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function countJpegs(result: DriveSummary) {
  let total = 0
  for (const mime of JPEG_MIME_TYPES) total += result.mime_counts[mime] ?? 0
  return total
}

function resetCount() {
  count.value = undefined
  countEdited.value = false
}

function syncCountWithSummary(result: DriveSummary | undefined) {
  if (!result || countEdited.value) return
  count.value = countJpegs(result)
}

function shouldShowRecalculate() {
  return packageEdited.value && individualEdited.value && !!count.value
}

function applySuggestions() {
  if (!packageEdited.value && packageSuggestion.value != null) {
    state.value.gallery_price = packageSuggestion.value
  } else if (!individualEdited.value && individualSuggestion.value != null) {
    state.value.default_photo_price = individualSuggestion.value
  }
}

function applyPackageSuggestion() {
  packageEdited.value = false
  state.value.gallery_price = packageSuggestion.value
}

function applyIndividualSuggestion() {
  individualEdited.value = false
  state.value.default_photo_price = individualSuggestion.value
}

function editCount(value: number | undefined) {
  countEdited.value = true
  count.value = value
}

function editPackage(value: number | undefined) {
  packageEdited.value = true
  state.value.gallery_price = value
}

function editIndividual(value: number | undefined) {
  individualEdited.value = true
  state.value.default_photo_price = value
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getPackageSuggestion() {
  return calculateDiscountedTotal(
    state.value.default_photo_price ?? 0,
    count.value ?? 0,
    discount.value,
  )
}

function getIndividualSuggestion() {
  return calculateUnitPriceFromTotal(
    state.value.gallery_price ?? 0,
    count.value ?? 0,
    discount.value,
  )
}

function getCountDescription() {
  if (isFetching.value) return 'Contando imagens da pasta...'
  if (isError.value) return 'Não foi possível contar. Informe uma estimativa.'
  return 'Detectada pela pasta de origem; você pode ajustar a estimativa.'
}

function getPriceFormatOptions() {
  return { style: 'currency', currency: state.value.gallery_price_currency } as const
}

function getFolderId() {
  return state.value.source_folder_id
}

function getQueryKey() {
  return ['drive-folder-pricing-count', folderId.value]
}

function getQueryEnabled() {
  return state.value.enable_sales && !!folderId.value
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchFolderSummary() {
  return apiFetch<DriveSummary>('/api/drive/google/files/', {
    query: { folder_id: folderId.value, summary: '1' },
  })
}

async function fetchClients() {
  const items: Client[] = []
  let page = 1
  while (true) {
    const response = await apiFetch<ClientList>('/api/clients/', {
      query: { page, page_size: 100 },
    })
    items.push(...response.results)
    if (!response.next)
      return items.map((client) => ({
        label: `${client.name} · ${client.email}`,
        value: client.id,
      }))
    page += 1
  }
}
</script>

<template>
  <div class="space-y-6">
    <USeparator size="xs" label="Entrega incluída" />
    <UFormField
      label="Fotos incluídas no trabalho"
      name="included_photo_mode"
      description="Defina quais originais fazem parte do trabalho contratado. A venda de extras é opcional."
    >
      <USelect
        v-model="state.included_photo_mode"
        :items="[
          { label: 'Sem fotos incluídas', value: 'none' },
          { label: 'Incluir todas as fotos', value: 'all' },
          { label: 'Eu escolho quais fotos liberar', value: 'photographer' },
          { label: 'O cliente escolhe dentro de uma franquia', value: 'client' },
        ]"
        class="w-full"
      />
    </UFormField>
    <UAlert
      v-if="state.included_photo_mode === 'photographer'"
      title="Liberação por foto"
      description="Após criar a galeria, use o ícone de presente em Gerenciar fotos para liberar os originais escolhidos. Todos com acesso à galeria poderão baixar essas fotos."
      color="neutral"
      variant="subtle"
    />
    <template v-if="state.included_photo_mode === 'client'">
      <UFormField
        label="Clientes vinculados"
        name="clients"
        required
        description="Somente essas contas poderão usar a franquia, entrando com o email cadastrado."
      >
        <USelectMenu
          v-model="state.clients"
          :items="clients ?? []"
          value-key="value"
          multiple
          class="w-full"
          placeholder="Selecione ao menos um cliente"
          :loading="clientsPending"
          :disabled="clientsPending || clientsError"
          :ui="{ content: 'z-[60]' }"
        />
      </UFormField>
      <UAlert
        v-if="clientsError"
        title="Não foi possível carregar os clientes."
        color="error"
        :actions="[{ label: 'Tentar novamente', onClick: () => refetchClients() }]"
      />
      <UFormField
        label="Fotos incluídas por cliente"
        name="included_photo_limit"
        description="Exemplo: 15 fotos incluídas; as extras podem ser compradas."
      >
        <UInputNumber
          v-model="state.included_photo_limit"
          :min="1"
          :max="10000"
          :step="1"
          class="w-full sm:max-w-48"
        />
      </UFormField>
      <UAlert
        title="Franquia para os clientes vinculados"
        description="Cada cliente selecionado terá sua própria franquia. As escolhas são confirmadas pelo cliente e não podem ser trocadas; reduzir o limite depois não revoga os originais já liberados."
        color="neutral"
        variant="subtle"
      />
    </template>
    <USeparator size="xs" label="Venda de extras" />
    <UAlert
      v-if="state.included_photo_mode === 'all'"
      title="Todos os originais liberados"
      description="Quem tiver acesso à galeria poderá baixar qualquer original, sem pagamento. A venda de extras fica desativada."
      color="neutral"
      variant="subtle"
    />
    <USwitch
      v-model="state.enable_sales"
      :disabled="state.included_photo_mode === 'all'"
      label="Vender fotos extras"
      description="Permita comprar fotos individuais ou completar a coleção com o pacote."
    />
    <template v-if="state.enable_sales">
      <USeparator />
      <div class="grid gap-5 sm:grid-cols-2">
        <UFormField label="Quantidade de fotos" :description="countDescription">
          <UInputNumber
            :model-value="count"
            :min="0"
            :step="1"
            :precision="0"
            class="w-full"
            @update:model-value="editCount"
          />
        </UFormField>
        <UFormField
          label="Desconto do pacote (%)"
          description="Usado apenas nas sugestões de preço."
        >
          <UInputNumber v-model="discount" :min="0" :max="90" :step="5" class="w-full" />
        </UFormField>
      </div>
      <p v-if="count === 0" class="text-xs text-muted">
        Nenhuma imagem JPEG importável encontrada. Ajuste a quantidade se estiver planejando
        adicionar fotos.
      </p>
      <UFormField name="gallery_price_currency" label="Moeda">
        <USelect
          v-model="state.gallery_price_currency"
          :items="CURRENCIES"
          class="w-full sm:max-w-48"
        />
      </UFormField>
      <div class="grid gap-5 sm:grid-cols-2">
        <UFormField
          name="gallery_price"
          label="Preço do pacote"
          description="Valor pela galeria completa."
        >
          <UInputNumber
            :model-value="state.gallery_price"
            :min="0.01"
            :max="99999999.99"
            :format-options="priceFormatOptions"
            class="w-full"
            @update:model-value="editPackage"
          />
        </UFormField>
        <UFormField
          name="default_photo_price"
          :required="state.included_photo_mode === 'client'"
          label="Preço individual padrão"
          description="Fotos com preço próprio mantêm sua exceção."
        >
          <UInputNumber
            :model-value="state.default_photo_price"
            :min="0.01"
            :max="99999999.99"
            :format-options="priceFormatOptions"
            class="w-full"
            @update:model-value="editIndividual"
          />
        </UFormField>
      </div>
      <p class="text-xs leading-relaxed text-muted">
        Preencha um dos preços para sugerir o outro usando a quantidade de fotos e o desconto.
        Valores editados manualmente são preservados. A sugestão é um cálculo, não uma recomendação
        de preço de mercado.
      </p>
      <div v-if="showRecalculate" class="flex flex-wrap gap-2">
        <UButton
          v-if="packageSuggestion"
          label="Recalcular pacote"
          color="neutral"
          variant="soft"
          size="xs"
          @click="applyPackageSuggestion"
        />
        <UButton
          v-if="individualSuggestion"
          label="Recalcular individual"
          color="neutral"
          variant="soft"
          size="xs"
          @click="applyIndividualSuggestion"
        />
      </div>
      <USeparator />
      <USwitch
        v-model="state.allow_individual_purchase"
        :disabled="state.included_photo_mode === 'client'"
        label="Permitir compra individual"
        description="Usa o preço padrão por foto, com exceções configuráveis nos cards."
      />
    </template>
    <p v-else class="text-sm text-muted">
      As fotos incluídas continuam disponíveis. Ative a venda de extras quando quiser oferecer
      outras fotos ou o pacote completo.
    </p>
  </div>
</template>
