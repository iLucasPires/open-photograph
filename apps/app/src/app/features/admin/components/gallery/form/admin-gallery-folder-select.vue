<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { DriveFolderTree } from '@/app/features/setup/types/drive'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{
  disabled?: boolean
}>()
const folderId = defineModel<string>({ required: true })

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const open = ref(false)
const searchTerm = shallowRef('')
const search = refDebounced(searchTerm, 300)
const selectedName = shallowRef('')

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const {
  data: folders,
  isFetching,
  isError,
  refetch,
} = useQuery({
  queryKey: computed(() => ['drive', 'google', 'folders', search.value]),
  queryFn: getFolderOptions,
  enabled: open,
  retry: false,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const folderOptions = computed(getFolderOptions2)

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getFolderOptions() {
  return apiFetch<DriveFolderTree[]>('/api/drive/google/folders/', {
    query: {
      tree: 'true',
      search: search.value,
    },
  })
}

function getFolderOptions2() {
  const items = (folders.value ?? []).map((folder) => ({
    label: folder.path || folder.name,
    value: folder.id,
    icon: 'i-lucide-folder',
  }))
  if (folderId.value && !items.some((item) => item.value === folderId.value)) {
    items.unshift({
      label: selectedName.value || `Pasta vinculada (${folderId.value})`,
      value: folderId.value,
      icon: 'i-lucide-folder',
    })
  }
  return items
}
</script>

<template>
  <USelectMenu
    v-model:open="open"
    v-model:search-term="searchTerm"
    v-model="folderId"
    :items="folderOptions"
    :loading="isFetching"
    :disabled="disabled"
    placeholder="Selecione uma pasta do Drive"
    :ui="{ content: 'z-[60]' }"
    :search-input="{ placeholder: 'Buscar por nome da pasta' }"
    class="w-full"
    value-key="value"
    icon="i-lucide-folder-search"
    virtualize
    ignore-filter
    clear
    @update:model-value="
      selectedName = folderOptions.find((folder) => folder.value === $event)?.label ?? ''
    "
  >
    <template #empty>
      <div class="space-y-2 p-4 text-center text-sm text-muted">
        <p v-if="isFetching">Buscando pastas…</p>
        <template v-else-if="isError">
          <p>Não foi possível buscar as pastas. Confira a conexão com o Drive.</p>
          <UButton label="Tentar novamente" color="neutral" variant="ghost" @click="refetch()" />
        </template>
        <p v-else>
          {{
            search.trim()
              ? 'Nenhuma pasta encontrada.'
              : 'Nenhuma pasta disponível nesta conta do Drive.'
          }}
        </p>
      </div>
    </template>
  </USelectMenu>
</template>
