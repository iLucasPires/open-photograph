<script setup lang="ts">
import type { Gallery } from '@/app/features/gallery/types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ galleries: Gallery[] }>()
defineEmits<{ edit: [gallery: Gallery]; photos: [gallery: Gallery] }>()
</script>

<template>
  <UPageGrid>
    <CGalleryCard
      v-for="gallery in galleries"
      :key="gallery.id"
      :gallery="gallery"
      @edit="$emit('edit', gallery)"
      @photos="$emit('photos', gallery)"
    />
  </UPageGrid>
</template>
