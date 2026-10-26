<script setup lang="ts">
import { galleryThemeKey } from '../constants/theme'

const theme = ref('masonry')
provide(galleryThemeKey, theme)
</script>

<template>
  <div class="gallery-shell flex min-h-dvh flex-col bg-default" :data-theme="theme">
    <header class="gallery-shell-header border-b border-default/60 bg-default/90 backdrop-blur-xl">
      <div
        class="gallery-shell-container mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-10 lg:px-14"
      >
        <RouterLink
          :to="{ name: 'gallery', params: { slug: $route.params.slug } }"
          class="flex items-center gap-2.5 text-muted transition-colors hover:text-highlighted"
        >
          <UIcon name="i-lucide-aperture" class="size-5 text-highlighted" />
          <span class="text-xs font-medium tracking-wide">Galeria de fotos</span>
        </RouterLink>
        <CGalleryAccountMenu />
      </div>
    </header>

    <main
      class="gallery-shell-main mx-auto w-full max-w-[1440px] flex-1 px-5 pb-16 pt-10 sm:px-10 sm:pt-14 lg:px-14"
    >
      <RouterView />
    </main>

    <footer class="gallery-shell-footer border-t border-default/60">
      <div
        class="mx-auto flex max-w-[1440px] items-center gap-2 px-5 py-6 text-xs text-dimmed sm:px-10 lg:px-14"
      >
        <UIcon name="i-lucide-aperture" class="size-4" />
        <span>Open Photographer</span>
      </div>
    </footer>
  </div>
</template>
