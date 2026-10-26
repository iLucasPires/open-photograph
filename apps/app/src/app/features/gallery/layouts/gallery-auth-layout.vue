<script setup lang="ts">
defineProps<{ title: string; description: string }>();
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-default px-5 py-10 sm:px-10 sm:py-14">
    <div class="w-full max-w-md space-y-8">
      <div class="flex items-center justify-center gap-2.5 text-highlighted">
        <UIcon name="i-lucide-aperture" class="size-5" />
        <span class="text-xs font-medium tracking-wide">Open Photograph</span>
      </div>
      <UCard
        :ui="{
          root: 'rounded-2xl shadow-none ring-default/60',
          header: 'p-6 sm:p-8',
          body: 'p-6 sm:p-8',
        }"
      >
        <template #header>
          <div class="space-y-3">
            <p class="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">Sua galeria</p>
            <h1 class="font-serif text-4xl tracking-tight text-highlighted">{{ title }}</h1>
            <p class="text-sm leading-relaxed text-muted">{{ description }}</p>
          </div>
        </template>
        <slot />
      </UCard>
    </div>
  </main>
</template>
