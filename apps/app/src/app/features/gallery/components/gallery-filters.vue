<script setup lang="ts">
import type { GalleryTag } from '../types'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{
  tags: GalleryTag[]
  modelValue: string | null // tag slug ativo, null = todos
}>()
const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function select(slug: string | null) {
  emit('update:modelValue', slug)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Todos -->
    <button
      type="button"
      class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
      :class="
        modelValue === null
          ? 'bg-primary text-inverted'
          : 'bg-elevated text-muted hover:text-default hover:bg-elevated/80'
      "
      @click="select(null)"
    >
      Todos
    </button>

    <!-- Tags -->
    <button
      v-for="tag in tags"
      :key="tag.id"
      type="button"
      class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
      :class="
        modelValue === tag.slug
          ? 'bg-primary text-inverted'
          : 'bg-elevated text-muted hover:text-default hover:bg-elevated/80'
      "
      @click="select(tag.slug)"
    >
      {{ tag.title }}
    </button>
  </div>
</template>
