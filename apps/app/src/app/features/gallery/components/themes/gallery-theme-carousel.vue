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
  <div class="flex flex-col gap-7 sm:gap-9">
    <section class="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <slot name="heading" />
      <slot name="actions" />
    </section>
    <div class="flex min-w-0 flex-col gap-7 sm:gap-9">
      <USeparator />
      <slot name="controls" />
      <slot name="photos">
        <template v-if="gallery">
          <div class="px-10 pb-12 sm:px-12">
            <UCarousel
              v-slot="{ item }"
              :items="photos"
              :arrows="photos.length > 1"
              :dots="photos.length > 1"
              :ui="{ item: 'basis-full', container: 'items-center' }"
              class="mx-auto w-full max-w-4xl"
            >
              <CPublicGalleryPhotoCard
                :photo="item"
                :gallery="gallery"
                @click="emit('select', $event)"
              />
            </UCarousel>
          </div>
        </template>
      </slot>
    </div>
  </div>
</template>

<style>
[data-theme='carousel'] .gallery-shell-main {
  max-width: 1200px;
  padding-top: 24px;
}
</style>
