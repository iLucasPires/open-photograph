<script setup lang="ts">
import type { SetupStatus } from '../types'
import { apiFetch } from '@/app/core/clients/api'
import { useQuery } from '@tanstack/vue-query'
import { useSetupStepper } from '../composables/useSetupStepper'

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data: status } = useQuery({
  queryKey: ['setup', 'status'],
  queryFn: fetchStatus,
  staleTime: 30_000,
})

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const { steps, currentIndex, navigateToStep } = useSetupStepper(status)

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchStatus() {
  return apiFetch<SetupStatus>('/api/setup/status/')
}
</script>

<template>
  <nav aria-label="Etapas da configuração" class="space-y-6">
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-widest text-primary">Primeiros passos</p>
      <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
        Seu espaço de trabalho começa aqui.
      </h2>
      <p class="text-sm leading-relaxed text-muted">
        Prepare sua conta, escolha onde guardar suas fotos e configure suas vendas.
      </p>
    </div>
    <UStepper
      :model-value="currentIndex"
      :items="steps"
      :linear="false"
      orientation="vertical"
      size="md"
      class="hidden lg:flex"
      @update:model-value="navigateToStep"
    />
    <div class="lg:hidden">
      <p class="mb-2 text-sm font-medium text-default">{{ steps[currentIndex]?.title }}</p>
      <UProgress
        :model-value="currentIndex + 1"
        :max="steps.length"
        size="sm"
        aria-label="Progresso da configuração"
      />
    </div>
    <UAlert
      icon="i-lucide-settings-2"
      color="neutral"
      variant="subtle"
      title="No seu ritmo"
      description="Armazenamento e pagamentos também podem ser ajustados depois, nas configurações."
    />
  </nav>
</template>
