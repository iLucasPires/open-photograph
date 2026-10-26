<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ title: string; summary: string; total: number; pageSize: number }>()
const page = defineModel<number>('page', { default: 1 })
</script>

<template>
  <UCard
    :ui="{
      root: 'overflow-hidden rounded-xl shadow-none ring-default/60',
      header: 'flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5',
      body: 'p-0 sm:p-0',
      footer: 'flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5',
    }"
  >
    <template #header>
      <h2 class="text-xs font-medium text-muted">{{ title }}</h2>
      <slot name="toolbar" />
    </template>
    <slot />
    <template #footer>
      <span class="text-xs text-muted">{{ summary }}</span>
      <UPagination
        v-if="total > pageSize"
        v-model:page="page"
        :total="total"
        :items-per-page="pageSize"
        color="neutral"
        size="xs"
      />
    </template>
  </UCard>
</template>
