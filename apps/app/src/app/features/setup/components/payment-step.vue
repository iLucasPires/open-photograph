<script setup lang="ts">
import type { Setup } from '../types'
import { invalidateSetupCache } from '@/app/core/guards/setup-guard'
import { apiFetch } from '@/app/core/clients/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = withDefaults(defineProps<{ mode?: 'setup' | 'settings' }>(), { mode: 'setup' })
const emit = defineEmits<{ saved: [] }>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const options = [
  { label: 'Sem pagamentos', value: 'none' },
  { label: 'Stripe', value: 'stripe' },
  { label: 'Mercado Pago', value: 'mercado_pago' },
]

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const toast = useToast()
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const selected = ref('none')

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: setups,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: ['setups'],
  queryFn: fetchSetups,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const current = computed(getCurrent)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: submitSave,
  async onSuccess() {
    invalidateSetupCache()
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['setups'] }),
      queryClient.invalidateQueries({ queryKey: ['setup', 'status'] }),
    ])
    toast.add({ title: 'Provedor atualizado.', color: 'success' })
  },
  onError(error: {
    data?: { provider?: string[]; detail?: string; errors?: { detail: string }[] }
  }) {
    selected.value = current.value?.is_active ? current.value.provider : 'none'
    toast.add({
      title:
        error.data?.provider?.[0] ??
        error.data?.errors?.[0]?.detail ??
        error.data?.detail ??
        'Falha ao salvar o provedor.',
      color: 'error',
    })
  },
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(
  current,
  (setup) => {
    if (setup) selected.value = setup.is_active ? setup.provider : 'none'
  },
  { immediate: true },
)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function selectProvider(value: string) {
  if (value === 'none' && !current.value) return
  const provider = value === 'none' ? current.value!.provider : value
  save.mutate({
    type: 'payment',
    provider,
    name: options.find((option) => option.value === provider)?.label ?? provider,
    is_active: value !== 'none',
  })
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getCurrent() {
  return setups.value?.find((setup) => setup.type === 'payment')
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitSave(payload: {
  type: 'payment' | 'storage'
  provider: string
  name: string
  is_active: boolean
}) {
  return apiFetch<Setup>('/api/setup/', { method: 'POST', body: payload })
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

async function fetchSetups() {
  const response = await apiFetch<{
    results: Setup[]
  }>('/api/setup/')
  return response.results
}
</script>

<template>
  <UCard :ui="{ root: 'rounded-2xl shadow-none ring-default/60', body: 'space-y-6' }">
    <template #header
      ><div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-medium text-highlighted">Provedor de pagamento</h2>
        <UBadge
          v-if="!isPending && !isError"
          :label="current?.is_active ? current.name : 'Desativado'"
          color="neutral"
          variant="subtle"
        /></div
    ></template>
    <UAlert
      v-if="isError"
      color="error"
      title="Erro ao carregar a seleção."
      :actions="[{ label: 'Tentar novamente', onClick: () => refetch() }]"
    />
    <UFormField
      v-else
      label="Receber pagamentos com"
      description="Escolha o provedor usado nas novas compras das suas galerias."
    >
      <USelect
        v-model="selected"
        :items="options"
        :loading="isPending || save.isPending.value"
        :disabled="isPending || save.isPending.value"
        class="w-full"
      />
    </UFormField>
    <p class="text-xs leading-relaxed text-muted">
      A seleção é salva ao confirmar abaixo. As credenciais de integração são configuradas no
      servidor.
    </p>
    <UButton
      label="Salvar configuração"
      icon="i-lucide-check"
      color="neutral"
      class="rounded-full"
      :loading="save.isPending.value"
      :disabled="
        isPending || isError || selected === (current?.is_active ? current.provider : 'none')
      "
      @click="selectProvider(selected)"
    />
    <template v-if="props.mode === 'setup'" #footer>
      <UButton
        label="Continuar"
        :disabled="
          isPending ||
          isError ||
          save.isPending.value ||
          selected !== (current?.is_active ? current.provider : 'none')
        "
        @click="emit('saved')"
      />
    </template>
  </UCard>
</template>
