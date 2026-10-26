<script setup lang="ts">
import type { Gallery } from '@/app/features/gallery/types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ gallery: Gallery }>()
defineEmits<{ edit: [gallery: Gallery]; photos: [gallery: Gallery] }>()
</script>

<template>
  <UPageCard :title="gallery.name" :description="gallery.description">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UBadge
        :label="gallery.is_published ? 'Publicada' : 'Rascunho'"
        :color="gallery.is_published ? 'success' : 'neutral'"
        variant="subtle"
      />
      <div class="flex gap-2">
        <UButton
          label="Editar"
          icon="i-lucide-settings"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="$emit('edit', gallery)"
        />
        <UButton
          label="Fotos"
          icon="i-lucide-images"
          color="neutral"
          variant="outline"
          size="sm"
          @click="$emit('photos', gallery)"
        />
      </div>
    </div>
  </UPageCard>
</template>
