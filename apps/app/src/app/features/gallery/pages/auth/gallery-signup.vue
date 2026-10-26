<script setup lang="ts">
import type { ApiErrorItem, ApiError } from '@/app/features/gallery/types/auth/signup'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients/api'
import type { SessionResponse } from '@/app/shared/services/session'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const DEFAULT_DESTINATION = '/gallery/login'
const ALLOWED_NEXT_PREFIX = '/g/'
const MESSAGES = {
  passwordMismatch: 'As senhas precisam ser iguais.',
  signupFailed:
    'Não foi possível criar a conta. Verifique seu email ou tente entrar com sua conta existente.',
}

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const email = ref('')
const password = ref('')
const confirmation = ref('')
const errorMessage = ref('')

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const next = computed(getNext)
const loginRoute = computed(getLoginRoute)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const signup = useMutation({
  mutationFn: requestSignup,
  onSuccess: handleSignupSuccess,
  onError: handleSignupError,
})

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function requestSignup() {
  return apiFetch<SessionResponse>('/api/browser/v1/auth/signup', {
    method: 'POST',
    body: { email: email.value.trim(), password: password.value },
  })
}

function clearPasswords() {
  password.value = ''
  confirmation.value = ''
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getNext() {
  const value = route.query.next
  const isAllowed = typeof value === 'string' && value.startsWith(ALLOWED_NEXT_PREFIX)
  return isAllowed ? value : DEFAULT_DESTINATION
}

function getLoginRoute() {
  return { name: 'gallery.login', query: { next: next.value } }
}

function getErrorMessage(item: ApiErrorItem) {
  return item.message
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function handleSignupSuccess(session: SessionResponse) {
  clearPasswords()

  if (!session.meta.is_authenticated) {
    await router.replace(loginRoute.value)
    return
  }

  queryClient.clear()
  queryClient.setQueryData(['auth', 'session'], session)
  await router.replace(next.value)
}

function handleSignupError(error: unknown) {
  const details = (error as ApiError).data?.errors?.map(getErrorMessage).join(' ')
  errorMessage.value = details || MESSAGES.signupFailed
}

function submit() {
  if (signup.isPending.value) return
  errorMessage.value = ''

  if (password.value !== confirmation.value) {
    errorMessage.value = MESSAGES.passwordMismatch
    return
  }

  signup.mutate()
}
</script>

<template>
  <CGalleryAuthLayout
    title="Criar sua conta"
    description="Cadastre-se para comprar fotos e acompanhar suas compras."
  >
    <form class="space-y-5" @submit.prevent="submit">
      <UAlert v-if="errorMessage" :title="errorMessage" color="error" />
      <UFormField label="E-mail" required>
        <UInput
          v-model="email"
          type="email"
          autocomplete="email"
          required
          size="lg"
          class="w-full"
          :disabled="signup.isPending.value"
        />
      </UFormField>
      <UFormField label="Senha" required>
        <UInput
          v-model="password"
          type="password"
          autocomplete="new-password"
          required
          size="lg"
          class="w-full"
          :disabled="signup.isPending.value"
        />
      </UFormField>
      <UFormField label="Confirmar senha" required>
        <UInput
          v-model="confirmation"
          type="password"
          autocomplete="new-password"
          required
          size="lg"
          class="w-full"
          :disabled="signup.isPending.value"
        />
      </UFormField>
      <UButton
        type="submit"
        label="Criar conta"
        size="lg"
        color="neutral"
        block
        class="rounded-full"
        :loading="signup.isPending.value"
      />
      <UButton label="Já tenho conta" :to="loginRoute" color="neutral" variant="link" />
    </form>
  </CGalleryAuthLayout>
</template>
