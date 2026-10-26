<script setup lang="ts">
// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ loading?: boolean; invalid?: boolean }>()
const emit = defineEmits<{ submit: [code: string] }>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const INVALID_CODE_MESSAGE = 'Código inválido. Confira e tente novamente.'

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const accessCode = ref('')

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const hasCode = computed(getHasCode)

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getHasCode() {
  return !!accessCode.value.trim()
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function submit() {
  if (!hasCode.value) return
  emit('submit', accessCode.value)
}
</script>

<template>
  <UCard class="mx-auto my-8 w-full max-w-md" :ui="{ body: 'space-y-6 p-6 sm:p-8' }">
    <div class="space-y-3">
      <UAvatar icon="i-lucide-lock-keyhole" size="lg" />
      <h1 class="text-xl font-semibold tracking-tight text-highlighted">Galeria protegida</h1>
      <p class="text-sm text-muted">Informe o código recebido do fotógrafo para ver as fotos.</p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <UFormField label="Código de acesso" :error="invalid ? INVALID_CODE_MESSAGE : undefined">
        <UInput
          v-model="accessCode"
          type="password"
          autocomplete="off"
          autofocus
          required
          class="w-full"
          :disabled="loading"
        />
      </UFormField>
      <UButton
        type="submit"
        label="Abrir galeria"
        icon="i-lucide-arrow-right"
        color="neutral"
        block
        :loading="loading"
        :disabled="!hasCode"
      />
    </form>
  </UCard>
</template>
