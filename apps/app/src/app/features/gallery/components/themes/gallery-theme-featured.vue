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
  <div class="flex flex-col gap-7 sm:gap-9 [&_.gallery-eyebrow]:justify-center">
    <section class="flex flex-col items-center gap-6 text-center">
      <slot name="heading" />
      <slot name="actions" />
    </section>
    <div class="flex min-w-0 flex-col gap-7 sm:gap-9">
      <USeparator />
      <slot name="controls" />
      <slot name="photos">
        <template v-if="gallery">
          <div class="flex flex-col gap-6">
            <div v-if="photos[0]" class="mx-auto w-full max-w-5xl">
              <CPublicGalleryPhotoCard
                :photo="photos[0]"
                :gallery="gallery"
                @click="emit('select', $event)"
              />
            </div>
            <div
              class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <div v-for="photo in photos.slice(1)" :key="photo.id">
                <CPublicGalleryPhotoCard
                  :photo="photo"
                  :gallery="gallery"
                  @click="emit('select', $event)"
                />
              </div>
            </div>
          </div>
        </template>
      </slot>
    </div>
  </div>
</template>

<style>
[data-theme='featured'] .gallery-shell-main {
  padding-top: 64px;
}
@media (max-width: 639px) {
  [data-theme='featured'] .gallery-shell-main {
    padding-top: 32px;
  }
}
</style>
