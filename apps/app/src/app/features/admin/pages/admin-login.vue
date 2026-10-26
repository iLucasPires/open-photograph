<script setup lang="ts">
// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute();

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const destination = computed(getDestination);

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getDestination() {
  const next = route.query.next;
  return typeof next === "string" &&
    (next === "/admin" || next.startsWith("/admin/") || next.startsWith("/setup/")) &&
    next !== "/admin/login"
    ? next
    : "/admin/galleries";
}
</script>
<template>
  <main class="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10">
    <div class="w-full max-w-md space-y-6">
      <div class="flex items-center justify-center gap-2 text-highlighted">
        <UIcon name="i-lucide-aperture" class="size-8 text-primary" />
        <span class="text-2xl font-semibold">Open Photograph</span>
      </div>
      <UCard :ui="{ header: 'p-6', body: 'p-6' }">
        <template #header>
          <h1 class="text-xl font-semibold text-highlighted">Entrar no painel</h1>
          <p class="mt-2 text-sm text-muted">
            Acesse o painel para gerenciar suas galerias e vendas.
          </p>
        </template>
        <CAdminAuthLoginForm :destination="destination" />
      </UCard>
    </div>
  </main>
</template>
