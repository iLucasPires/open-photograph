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
          <div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="photo in photos" :key="photo.id">
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
[data-theme='classic'] .gallery-shell-main {
  max-width: 1280px;
}
</style>
