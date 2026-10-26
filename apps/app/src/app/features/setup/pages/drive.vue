<script setup lang="ts">
import type { DriveStatus } from '../types'
import { apiFetch } from '@/app/core/clients/api'
import { useQuery } from '@tanstack/vue-query'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'SetupDrivePage' })

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const router = useRouter()

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data: status } = useQuery({
  queryKey: ['drive', 'google', 'status'],
  queryFn: fetchStatus,
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
// Navega quando o Drive for conectado com sucesso
watch(
  () => status.value?.connected,
  (connected) => {
    if (connected) router.push('/setup/payment')
  },
)

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchStatus() {
  return apiFetch<DriveStatus>('/api/drive/google/status/')
}
</script>

<template>
  <CSetupPage
    title="Onde suas fotos vão ficar?"
    description="Escolha de onde importar os arquivos originais e conecte sua conta."
  >
    <CDriveStep />
  </CSetupPage>
</template>
