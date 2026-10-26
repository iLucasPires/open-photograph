<template>
  <div class="min-h-dvh bg-muted/40">
    <header class="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-6 sm:px-8">
      <UIcon name="i-lucide-aperture" class="size-8 text-primary" />
      <span class="text-xl font-semibold tracking-tight text-highlighted">Open Photograph</span>
      <UBadge label="Configuração inicial" color="neutral" variant="subtle" class="ml-auto" />
    </header>
    <main
      class="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-10 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 lg:py-8"
    >
      <aside class="lg:sticky lg:top-8 lg:self-start"><CSetupProgress /></aside>
      <div class="min-w-0"><RouterView /></div>
    </main>
    <footer class="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-muted sm:px-8">
      Open Photograph &mdash; Suas fotos, seu espaço.
    </footer>
  </div>
</template>
