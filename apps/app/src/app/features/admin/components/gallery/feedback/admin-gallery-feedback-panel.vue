<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import type { AdminGalleryFeedback } from '@/app/features/gallery/types/feedback'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{ galleryId: string }>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data, isPending, isError, refetch } = useQuery({
  queryKey: computed(() => ['gallery-admin-feedback', props.galleryId]),
  queryFn: fetchAdminGalleryFeedback,
  refetchInterval: 10000,
})

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchAdminGalleryFeedback() {
  return apiFetch<AdminGalleryFeedback>(`/api/galleries/${props.galleryId}/feedback/`)
}
</script>

<template>
  <div class="space-y-6">
    <USkeleton v-if="isPending" class="h-40 w-full" />
    <UAlert
      v-else-if="isError"
      title="Não foi possível carregar o feedback"
      color="error"
      :actions="[
        {
          label: 'Tentar novamente',
          onClick: () => refetch(),
        },
      ]"
    />
    <template v-else-if="data">
      <section class="space-y-3">
        <h3 class="text-sm font-medium">
          Seleções enviadas <span class="text-muted">{{ data.selections.length }}</span>
        </h3>
        <p v-if="!data.selections.length" class="text-sm text-muted">
          Nenhuma seleção enviada ainda.
        </p>
        <UCard
          v-for="selection in data.selections"
          :key="selection.id"
          :ui="{ body: 'space-y-3 p-4 sm:p-4' }"
        >
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p class="text-sm font-medium">{{ selection.name }}</p>
              <p class="text-xs text-muted">{{ selection.email }}</p>
            </div>
            <span class="text-xs text-muted">{{
              dateFormatter.format(new Date(selection.created_at))
            }}</span>
          </div>
          <p v-if="selection.message" class="whitespace-pre-wrap break-words text-sm text-muted">
            {{ selection.message }}
          </p>
          <p class="text-xs text-muted">{{ selection.photos.length }} fotos</p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="photo in selection.photos"
              :key="photo.id"
              :label="photo.name"
              color="neutral"
              variant="soft"
            />
          </div>
        </UCard>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-medium">
          Comentários <span class="text-muted">{{ data.comments.length }}</span>
        </h3>
        <p v-if="!data.comments.length" class="text-sm text-muted">Nenhum comentário ainda.</p>
        <div
          v-for="comment in data.comments"
          :key="comment.id"
          class="space-y-1 border-b border-default pb-3"
        >
          <p class="text-xs text-muted">
            {{ comment.photo_name }} · {{ comment.name }} ·
            {{ dateFormatter.format(new Date(comment.created_at)) }}
          </p>
          <p class="whitespace-pre-wrap break-words text-sm">{{ comment.text }}</p>
        </div>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-medium">Curtidas</h3>
        <p v-if="!data.likes.length" class="text-sm text-muted">Nenhuma curtida ainda.</p>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="photo in data.likes"
            :key="photo.id"
            :label="`${photo.name} · ${photo.count}`"
            icon="i-lucide-heart"
            color="neutral"
            variant="soft"
          />
        </div>
      </section>
    </template>
  </div>
</template>
