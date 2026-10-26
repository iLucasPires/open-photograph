<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import type { Client } from '@/app/features/admin/types/client/index'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{
  open?: boolean
  client: Client | null
}>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
  'after:leave': []
}>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const toast = useToast()
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const deleteClient = useMutation({
  mutationFn: submitDeleteClient,
  onSuccess: handleDeleteClientSuccess,
  onError: handleDeleteClientError,
  onSettled: handleDeleteClientSettled,
})

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function handleConfirm() {
  if (!props.client) return

  deleteClient.mutate(props.client.id)
  emit('close')
}

function submitDeleteClient(id: string) {
  return apiFetch(`/clients/${id}/`, { method: 'DELETE' })
}

function handleDeleteClientSuccess() {
  return toast.add({ title: 'Cliente removido.', color: 'success' })
}

function handleDeleteClientError() {
  return toast.add({ title: 'Erro ao remover cliente.', color: 'error' })
}

function handleDeleteClientSettled() {
  return queryClient.invalidateQueries({ queryKey: ['clients'] })
}
</script>

<template>
  <UModal
    :open="open"
    title="Excluir cliente"
    description=""
    :dismissible="!deleteClient.isPending.value"
    @update:open="emit('update:open', $event)"
    @after:leave="emit('after:leave')"
  >
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="ghost"
          :disabled="deleteClient.isPending.value"
          @click="emit('close')"
        />

        <UButton
          label="Excluir"
          color="red"
          :loading="deleteClient.isPending.value"
          @click="handleConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
