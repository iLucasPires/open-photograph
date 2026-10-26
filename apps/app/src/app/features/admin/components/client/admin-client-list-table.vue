<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Client } from '@/app/features/admin/types/client/index'
import { adminTableUi } from '../../constants/table'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{
  clients: Client[]
  total: number
  loading?: boolean
}>()
const page = defineModel<number>('page', { default: 1 })
const search = defineModel<string>('search', { default: '' })
const emit = defineEmits<{
  edit: [client: Client]
  delete: [client: Client]
}>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const columns: TableColumn<Client>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Telefone' },
  { id: 'actions', header: 'Ações' },
]
</script>

<template>
  <CAdminListFrame
    v-model:page="page"
    title="Todos os clientes"
    :summary="`${total} ${total === 1 ? 'cliente' : 'clientes'}`"
    :total="total"
    :page-size="10"
  >
    <template #toolbar>
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar clientes"
        aria-label="Buscar clientes"
        color="neutral"
        variant="subtle"
        class="w-full sm:w-64"
      />
    </template>
    <UTable :data="clients" :columns="columns" :loading="loading" class="w-full" :ui="adminTableUi">
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :alt="row.original.name"
            icon="i-lucide-user-round"
            size="sm"
            class="rounded-md"
          />
          <UButton
            :label="row.original.name"
            color="neutral"
            variant="link"
            class="p-0 font-medium text-highlighted"
            @click="emit('edit', row.original)"
          />
        </div>
      </template>
      <template #phone-cell="{ row }">
        {{ row.original.phone || '—' }}
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UButton
            label="Editar"
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="emit('edit', row.original)"
          />
          <UButton
            label="Excluir"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            @click="emit('delete', row.original)"
          />
        </div>
      </template>
      <template #empty>
        <UEmpty
          title="Nenhum cliente"
          :description="
            search ? 'Tente buscar por outro nome ou email.' : 'Cadastre um cliente no botão acima.'
          "
          icon="i-lucide-users"
          class="py-16"
        />
      </template>
    </UTable>
  </CAdminListFrame>
</template>
