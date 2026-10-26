<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ title: string; description: string; eyebrow: string }>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute()
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 sm:space-y-10">
    <UButton
      label="Voltar à galeria"
      icon="i-lucide-arrow-left"
      :to="`/g/${String(route.params.slug)}`"
      color="neutral"
      variant="ghost"
      class="rounded-full"
    />
    <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div class="max-w-2xl space-y-4">
        <p class="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">{{ eyebrow }}</p>
        <h1 class="font-serif text-4xl tracking-tight text-highlighted sm:text-5xl">{{ title }}</h1>
        <p class="text-sm leading-relaxed text-muted">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap gap-2"><slot name="actions" /></div>
    </div>
    <USeparator />
    <slot />
  </div>
</template>
