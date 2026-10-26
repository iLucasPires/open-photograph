<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ title: string; description: string }>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute()

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const stage = computed(getStage)

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getStage() {
  return { '/setup': 1, '/setup/drive': 2, '/setup/payment': 3, '/setup/done': 4 }[route.path] ?? 1
}
</script>

<template>
  <UCard class="w-full min-w-0 shadow-sm" :ui="{ header: 'p-6 sm:p-8', body: 'p-6 sm:p-8' }">
    <template #header>
      <div class="space-y-3">
        <UBadge color="primary" variant="subtle" :label="`Etapa ${stage} de 4`" />
        <h1 class="text-2xl font-semibold tracking-tight text-highlighted">{{ title }}</h1>
        <p class="text-sm leading-relaxed text-muted">{{ description }}</p>
      </div>
    </template>
    <slot />
  </UCard>
</template>
