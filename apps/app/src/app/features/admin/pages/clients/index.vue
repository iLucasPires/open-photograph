<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import CAdminClientDeleteModal from '../../components/client/admin-client-delete-modal.vue'
import CAdminClientFormModal from '../../components/client/admin-client-form-modal.vue'
import type { Client, ClientList } from '@/app/features/admin/types/client/index'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'AdminClientsPage' })

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const overlay = useOverlay()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const page = ref(1)
const search = ref('')
const debouncedSearch = refDebounced(search, 300)

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(debouncedSearch, () => {
  page.value = 1
})

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const formModal = overlay.create(CAdminClientFormModal, {
  props: { client: null },
})
const deleteModal = overlay.create(CAdminClientDeleteModal, {
  props: { client: null },
})

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data, isPending, isError, refetch } = useQuery({
  queryKey: computed(() => ['clients', page.value, debouncedSearch.value]),
  queryFn: fetchIndex,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const clients = computed(getClients)
const total = computed(getTotal)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function openNewClient() {
  formModal.open({ client: null })
}

function openEditClient(client: Client) {
  formModal.open({ client })
}

function openDeleteClient(client: Client) {
  deleteModal.open({ client })
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getClients() {
  return data.value?.results ?? []
}

function getTotal() {
  return data.value?.count ?? 0
}

// ---------------------------------------------------------------------------
// Funções: queries
// ---------------------------------------------------------------------------

function fetchIndex() {
  return apiFetch<ClientList>('/api/clients/', {
    query: {
      page: page.value,
      search: debouncedSearch.value,
    },
  })
}
</script>

<template>
  <CAdminPageFrame
    title="Clientes"
    eyebrow="Seu estúdio"
    description="As pessoas por trás de cada história."
  >
    <template #actions>
      <UButton
        label="Novo cliente"
        icon="i-lucide-plus"
        color="neutral"
        class="rounded-full px-5"
        size="md"
        @click="openNewClient"
      />
    </template>
    <div class="space-y-5">
      <UAlert
        v-if="isError"
        title="Não foi possível carregar os clientes."
        color="error"
        :actions="[{ label: 'Tentar novamente', onClick: () => refetch() }]"
      />

      <CAdminClientListTable
        v-else
        :clients="clients"
        :total="total"
        :loading="isPending"
        v-model:page="page"
        v-model:search="search"
        @edit="openEditClient"
        @delete="openDeleteClient"
      />
    </div>
  </CAdminPageFrame>
</template>
