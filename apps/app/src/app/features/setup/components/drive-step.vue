<script setup lang="ts">
import type { DriveStatus, Setup } from '../types'
import { invalidateSetupCache } from '@/app/core/guards/setup-guard'
import { apiFetch } from '@/app/core/clients/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = withDefaults(defineProps<{ mode?: 'setup' | 'settings' }>(), { mode: 'setup' })

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const options = [
  { label: 'Google Drive', value: 'google_drive' },
  { label: 'Disco local', value: 'local' },
  { label: 'Amazon S3 / R2', value: 's3' },
  { label: 'OneDrive', value: 'one_drive' },
]

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const router = useRouter()
const toast = useToast()
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const selected = ref('')

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
const {
  data: drive,
  isPending: drivePending,
  isError: driveError,
  refetch: refetchDrive,
} = useQuery({
  queryKey: ['drive', 'google', 'status'],
  queryFn: fetchDrive,
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
    selected.value = current.value?.provider ?? ''
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
const connect = useMutation({
  mutationFn: submitConnect,
  onSuccess({ url }) {
    window.location.href = url
  },
  onError() {
    toast.add({ title: 'Erro ao iniciar conexão com Google Drive.', color: 'error' })
  },
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(
  current,
  (setup) => {
    if (setup) selected.value = setup.provider
  },
  { immediate: true },
)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function selectProvider(provider: string) {
  save.mutate({
    type: 'storage',
    provider,
    name: options.find((option) => option.value === provider)?.label ?? provider,
    is_active: true,
  })
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getCurrent() {
  return setups.value?.find((setup) => setup.type === 'storage')
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

function submitConnect() {
  return apiFetch<{
    url: string
  }>('/api/drive/google/connect/', {
    method: 'POST',
    body: { callback_url: `${window.location.origin}${window.location.pathname}` },
  })
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

function fetchDrive() {
  return apiFetch<DriveStatus>('/api/drive/google/status/')
}
</script>

<template>
  <div class="space-y-5">
    <UCard :ui="{ root: 'rounded-2xl shadow-none ring-default/60', body: 'space-y-6' }">
      <template #header
        ><div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-sm font-medium text-highlighted">Origem dos arquivos</h2>
          <UBadge
            v-if="current && !isError"
            :label="current.name"
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
        label="Armazenamento"
        description="Escolha onde os arquivos originais das galerias ficam armazenados."
      >
        <USelect
          v-model="selected"
          :items="options"
          placeholder="Selecione a origem"
          :loading="isPending || save.isPending.value"
          :disabled="isPending || save.isPending.value"
          class="w-full"
        />
      </UFormField>
      <p class="text-xs leading-relaxed text-muted">
        A mudança define a origem utilizada nas próximas importações. Os arquivos existentes não são
        transferidos automaticamente.
      </p>
      <UButton
        label="Salvar configuração"
        icon="i-lucide-check"
        color="neutral"
        class="rounded-full"
        :loading="save.isPending.value"
        :disabled="isPending || isError || !selected || selected === current?.provider"
        @click="selectProvider(selected)"
      />
    </UCard>
    <UCard
      v-if="current?.provider === 'google_drive'"
      :ui="{ root: 'rounded-2xl shadow-none ring-default/60', body: 'space-y-4' }"
    >
      <template #header
        ><h2 class="text-sm font-medium text-highlighted">Conta Google Drive</h2></template
      >
      <USkeleton v-if="drivePending" class="h-20 rounded-lg" />
      <UAlert
        v-else-if="driveError"
        color="error"
        title="Não foi possível consultar a conexão."
        :actions="[{ label: 'Tentar novamente', onClick: () => refetchDrive() }]"
      />
      <UAlert
        v-else
        :color="drive?.connected ? 'success' : 'neutral'"
        :title="drive?.connected ? 'Google Drive conectado' : 'Conecte sua conta Google'"
        :description="
          drive?.configured
            ? (drive.email ?? 'Autorize o acesso aos arquivos originais.')
            : 'Configure as credenciais Google no .env do servidor para conectar.'
        "
      />
      <p v-if="drive?.connected" class="text-xs leading-relaxed text-muted">
        Se a importação apresentar problemas de autorização, reconecte a conta para renovar o
        acesso.
      </p>
      <template #footer>
        <UButton
          :label="drive?.connected ? 'Reconectar' : 'Conectar'"
          :disabled="drivePending || driveError || !drive?.configured || save.isPending.value"
          :loading="connect.isPending.value"
          @click="connect.mutate()"
          color="neutral"
          class="rounded-full"
        />
      </template>
    </UCard>
    <UButton
      v-if="props.mode === 'setup'"
      label="Continuar"
      :disabled="save.isPending.value || isPending || !current || selected !== current.provider"
      @click="router.push('/setup/payment')"
    />
  </div>
</template>
