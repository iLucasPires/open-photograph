<script setup lang="ts">
import type { VerifyError } from '@/app/features/gallery/types/auth/verify'
import { useMutation } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const VERIFY_URL = '/api/browser/v1/auth/email/verify'
const LOGIN_PATH = '/gallery/login'
const UNAUTHENTICATED_STATUS = 401
const MESSAGES = {
  success: 'Email confirmado. Volte para sua galeria para continuar a compra.',
  error:
    'Este link não pode ser confirmado. Verifique se ele expirou ou se o email já foi confirmado.',
}

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute()

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const verify = useMutation({
  mutationFn: verifyEmail,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const showConfirmButton = computed(getShowConfirmButton)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

// Allauth returns unauthenticated state after successfully verifying a link opened without a session.
function isVerifiedWithoutSession(error: unknown) {
  const { response, data } = error as VerifyError
  return response?.status === UNAUTHENTICATED_STATUS && data?.meta?.is_authenticated === false
}

async function verifyEmail() {
  try {
    await apiFetch(VERIFY_URL, {
      method: 'POST',
      body: { key: String(route.params.key) },
    })
  } catch (error) {
    if (isVerifiedWithoutSession(error)) return
    throw error
  }
}

function confirmEmail() {
  verify.mutate()
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getShowConfirmButton() {
  return !verify.isSuccess.value
}
</script>

<template>
  <main class="mx-auto max-w-md space-y-6 p-6">
    <h1 class="text-xl font-semibold">Confirmar email</h1>
    <UAlert v-if="verify.isSuccess.value" :title="MESSAGES.success" color="success" />
    <UAlert v-if="verify.isError.value" :title="MESSAGES.error" color="error" />
    <UButton
      v-if="showConfirmButton"
      label="Confirmar meu email"
      :loading="verify.isPending.value"
      @click="confirmEmail"
    />
    <UButton label="Entrar na conta" :to="LOGIN_PATH" color="neutral" variant="outline" />
  </main>
</template>
