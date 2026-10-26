<script setup lang="ts">
import CPublicGalleryPhotoCard from '../photo/gallery-photo-card.vue'
import type { Gallery, PublicPhoto } from '../../types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ photos: PublicPhoto[]; gallery?: Gallery }>()
const emit = defineEmits<{ select: [photo: PublicPhoto] }>()
</script>

<template>
  <div
    class="mx-auto grid max-w-[470px] grid-cols-1 items-start gap-7 sm:gap-9 lg:max-w-none lg:grid-cols-[minmax(0,470px)_minmax(0,300px)] lg:justify-center lg:gap-x-14"
  >
    <section
      class="flex min-w-0 flex-col gap-5 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-[104px] lg:max-h-[calc(100dvh-128px)] lg:overflow-y-auto"
    >
      <slot name="heading" />
      <slot name="actions" />
    </section>

    <div class="flex min-w-0 flex-col gap-7 sm:gap-9 lg:col-start-1 lg:row-start-1">
      <USeparator class="lg:hidden" />
      <slot name="controls" />
      <slot name="photos">
        <template v-if="gallery">
          <div class="mx-auto flex w-full max-w-[470px] flex-col gap-8">
            <div v-for="photo in photos" :key="photo.id" class="break-inside-avoid mb-5">
              <CPublicGalleryPhotoCard
                :photo="photo"
                :gallery="gallery"
                @click="emit('select', $event)"
              />
            </div>
          </div>
        </template>
      </slot>
    </div>
  </div>
</template>

<style>
[data-theme='instagram'] .gallery-shell-header {
  position: sticky;
  top: 0;
  z-index: 20;
}
[data-theme='instagram'] .gallery-shell-container {
  max-width: 975px;
}
[data-theme='instagram'] .gallery-shell-main {
  max-width: 670px;
  padding-top: 28px;
}
[data-theme='instagram'] .gallery-shell-footer > div {
  max-width: 670px;
}
@media (min-width: 1024px) {
  [data-theme='instagram'] .gallery-shell-main,
  [data-theme='instagram'] .gallery-shell-container,
  [data-theme='instagram'] .gallery-shell-footer > div {
    max-width: 1024px;
  }
}
@media (max-width: 639px) {
  [data-theme='instagram'] .gallery-shell-main {
    padding-inline: 12px;
  }
}
</style>
