<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ expanded: boolean; title?: string; description?: string; icon?: string }>()
</script>

<template>
  <div
    v-if="expanded"
    class="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]"
  >
    <UCard :ui="{ header: 'p-5 sm:p-6', body: 'p-5 sm:p-6' }">
      <template #header>
        <h2 class="text-base font-semibold text-highlighted">Escolha o armazenamento</h2>
        <p class="mt-1 text-sm leading-relaxed text-muted">
          Selecione onde suas fotos serão armazenadas.
        </p>
      </template>
      <slot name="providers" />
    </UCard>
    <UCard class="min-w-0" :ui="{ header: 'p-5 sm:p-6', body: 'p-5 sm:p-6' }">
      <template #header>
        <div class="flex items-start gap-3">
          <UIcon :name="icon || 'i-lucide-settings-2'" class="mt-1 size-6 shrink-0 text-primary" />
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-highlighted">
              {{ title || 'Configuração do provedor' }}
            </h2>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              {{ description || 'Escolha um provedor para configurar seu armazenamento.' }}
            </p>
          </div>
        </div>
      </template>
      <slot name="configuration" />
    </UCard>
  </div>
  <div v-else class="flex flex-col gap-6">
    <slot name="providers" />
    <slot name="configuration" />
  </div>
</template>
