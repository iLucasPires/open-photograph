<script setup lang="ts">
import type { Setup } from '../types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ setup: Setup; icon?: string }>()
</script>

<template>
  <UCard :ui="{ body: 'p-5 sm:p-6' }">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex min-w-0 items-center gap-4">
        <UIcon :name="icon || 'i-lucide-hard-drive'" class="size-8 shrink-0 text-primary" />
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-wider text-muted">Armazenamento atual</p>
          <h2 class="mt-1 break-words text-lg font-semibold text-highlighted">{{ setup.name }}</h2>
          <p class="mt-1 text-sm text-muted">
            {{
              setup.is_active
                ? 'Utilizado pelas suas galerias.'
                : 'Configuração salva, mas desativada.'
            }}
          </p>
        </div>
      </div>
      <UBadge
        :color="setup.is_active ? 'success' : 'neutral'"
        variant="subtle"
        size="md"
        :icon="setup.is_active ? 'i-lucide-circle-check' : 'i-lucide-circle-pause'"
        :label="setup.is_active ? 'Ativo' : 'Desativado'"
      />
    </div>
  </UCard>
</template>
