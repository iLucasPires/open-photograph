<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
withDefaults(defineProps<{ title: string; description?: string; eyebrow?: string }>(), {
  eyebrow: 'Seu estúdio',
})
</script>

<template>
  <UDashboardPanel :ui="{ body: 'gap-0 p-0 sm:p-0' }">
    <template #header>
      <UDashboardNavbar
        title="Painel do fotógrafo"
        :ui="{
          root: 'border-b border-default/60',
          title: 'text-xs font-medium tracking-wide text-muted',
        }"
      >
        <template #leading><UDashboardSidebarCollapse color="neutral" variant="ghost" /></template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div
        class="mx-auto w-full max-w-[1440px] space-y-8 px-5 pb-12 pt-10 sm:space-y-10 sm:px-10 sm:pt-14 lg:px-14"
      >
        <div class="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div class="max-w-2xl space-y-4">
            <p class="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              {{ eyebrow }}
            </p>
            <h1
              class="font-serif text-4xl leading-tight tracking-tight text-highlighted sm:text-5xl"
            >
              {{ title }}
            </h1>
            <p v-if="description" class="max-w-xl text-sm leading-relaxed text-muted">
              {{ description }}
            </p>
          </div>
          <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2 pb-1">
            <slot name="actions" />
          </div>
        </div>
        <USeparator />
        <slot />
      </div>
    </template>
  </UDashboardPanel>
</template>
