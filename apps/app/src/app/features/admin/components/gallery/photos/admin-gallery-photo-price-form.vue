<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { Photo } from '@/app/features/gallery/types/photo'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{
  photo: Photo
  defaultPrice?: string | null
  defaultCurrency?: string
}>()

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const toast = useToast()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const price = ref<number | undefined>(props.photo.price ? Number(props.photo.price) : undefined)
const currency = ref(
  props.photo.price
    ? props.photo.price_currency
    : (props.defaultCurrency ?? props.photo.price_currency),
)
const error = ref('')

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const save = useMutation({
  mutationFn: submitSave,
  onMutate: handleSaveMutate,
  onSuccess: handleSaveSuccess,
  onError: handleSaveError,
})

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submitSave() {
  return apiFetch(`/api/photos/${props.photo.id}/`, {
    method: 'PATCH',
    body: { price: price.value ? price.value.toFixed(2) : null, price_currency: currency.value },
  })
}

function handleSaveMutate() {
  error.value = ''
}

async function handleSaveSuccess() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin-gallery-photos'] }),
    queryClient.invalidateQueries({ queryKey: ['galleries'] }),
  ])
  toast.add({ title: 'Preço atualizado', color: 'success' })
}

function handleSaveError() {
  error.value = 'Não foi possível salvar o preço.'
}
</script>
<template>
  <form class="space-y-3" @submit.prevent="save.mutate()">
    <UFormField
      label="Preço individual"
      :description="
        defaultPrice
          ? `Vazio usa o padrão da galeria: ${defaultCurrency} ${defaultPrice}.`
          : 'Sem preço padrão, deixe vazio para não vender esta foto.'
      "
    >
      <UInputNumber
        v-model="price"
        :min="0.01"
        :max="99999999.99"
        :step="0.01"
        class="w-full"
        :disabled="save.isPending.value"
      />
    </UFormField>
    <USelect
      v-model="currency"
      :items="['BRL', 'USD', 'EUR']"
      aria-label="Moeda do preço individual"
      class="w-full"
      :disabled="save.isPending.value"
    />
    <p v-if="error" class="text-sm text-error">{{ error }}</p>
    <UButton
      type="submit"
      label="Salvar preço"
      color="neutral"
      variant="outline"
      :loading="save.isPending.value"
    />
  </form>
</template>
