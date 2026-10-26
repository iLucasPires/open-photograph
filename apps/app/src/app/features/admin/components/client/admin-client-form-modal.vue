<script setup lang="ts">
import { clientFormSchema } from '@/app/features/admin/schemas/client/form'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { iApiErrorResponse } from '@/app/shared/types'
import type { Client } from '@/app/features/admin/types/client/index'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{
  open?: boolean
  client: Client | null
}>()
const emit = defineEmits<{
  close: []
  'update:open': [value: boolean]
  'after:leave': []
}>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const errorMessage = ref('')
const state = reactive({
  name: '',
  email: '',
  phone: '',
  notes: '',
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
watch(
  [() => props.open, () => props.client],
  ([isOpen]) => {
    if (isOpen) {
      Object.assign(state, {
        name: props.client?.name ?? '',
        email: props.client?.email ?? '',
        phone: props.client?.phone ?? '',
        notes: props.client?.notes ?? '',
      })
      errorMessage.value = ''
    }
  },
  { immediate: true },
)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn,
  onSuccess,
  onError,
})

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function mutationFn() {
  const method = props.client ? 'PATCH' : 'POST'
  const url = props.client ? `/api/clients/${props.client.id}/` : '/api/clients/'

  return apiFetch<Client>(url, {
    method,
    body: clientFormSchema.parse(state),
  })
}

async function onSuccess() {
  toast.add({
    title: 'Cliente salvo',
    color: 'success',
  })

  emit('close')

  await queryClient.invalidateQueries({
    queryKey: ['clients'],
  })
}

async function onError(error: iApiErrorResponse) {
  const response = (error as { data?: { errors?: { detail: string }[] } }).data
  errorMessage.value =
    response?.errors?.map((item) => item.detail).join(' ') || 'Não foi possível salvar o cliente.'
}
</script>

<template>
  <UModal
    :open="open"
    :title="client ? 'Editar cliente' : 'Novo cliente'"
    :dismissible="!save.isPending.value"
    @update:open="emit('update:open', $event)"
    @after:leave="emit('after:leave')"
  >
    <template #body>
      <UForm
        id="client-form"
        class="space-y-5"
        :schema="clientFormSchema"
        :state="state"
        :disabled="save.isPending.value"
        @submit="save.mutate()"
      >
        <UAlert v-if="errorMessage" :title="errorMessage" color="error" />

        <UFormField label="Nome" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email" required>
          <UInput v-model="state.email" type="email" class="w-full" />
        </UFormField>

        <UFormField label="Telefone" name="phone">
          <UInput v-model="state.phone" type="tel" class="w-full" />
        </UFormField>

        <UFormField label="Observações internas" name="notes">
          <UTextarea v-model="state.notes" class="w-full" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="ghost"
          :disabled="save.isPending.value"
          @click="emit('close')"
        />

        <UButton
          type="submit"
          form="client-form"
          label="Salvar cliente"
          :loading="save.isPending.value"
        />
      </div>
    </template>
  </UModal>
</template>
