<script setup lang="ts">
import type { Credentials, AuthError } from '@/app/shared/types/auth'
import { apiFetch } from '@/app/core/clients/api'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { getSession, type SessionResponse } from '@/app/shared/services/session'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
const props = defineProps<{
  destination: string
}>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const BAD_CREDENTIALS_STATUS = 400
const MESSAGES = {
  sessionCheckFailed: 'Não foi possível verificar sua sessão. Tente entrar novamente.',
  loginIncomplete: 'Não foi possível concluir o login.',
  badCredentials: 'E-mail ou senha incorretos.',
  loginFailed: 'Não foi possível entrar. Tente novamente.',
}

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const router = useRouter()
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const authenticated = ref(false)

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const passwordInputType = computed(getPasswordInputType)
const passwordToggleIcon = computed(getPasswordToggleIcon)
const passwordToggleLabel = computed(getPasswordToggleLabel)
const canSubmit = computed(getCanSubmit)
const loginDestination = computed(getDestination)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const login = useMutation({
  mutationFn: requestLogin,
  onSuccess: handleLoginSuccess,
})

// ---------------------------------------------------------------------------
// Watchers e ciclo de vida
// ---------------------------------------------------------------------------
onMounted(redirectIfAuthenticated)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function requestLogin(credentials: Credentials) {
  return apiFetch<SessionResponse>('/api/browser/v1/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

async function redirectIfAuthenticated() {
  try {
    const session = await getSession()
    if (session?.meta.is_authenticated) {
      authenticated.value = true
      await router.replace(loginDestination.value)
    }
  } catch {
    errorMessage.value = MESSAGES.sessionCheckFailed
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getPasswordInputType() {
  return showPassword.value ? 'text' : 'password'
}

function getPasswordToggleIcon() {
  return showPassword.value ? 'i-lucide-eye-off' : 'i-lucide-eye'
}

function getPasswordToggleLabel() {
  return showPassword.value ? 'Ocultar senha' : 'Mostrar senha'
}

function getCanSubmit() {
  return !!email.value.trim() && !!password.value
}

function getLoginErrorMessage(error: unknown) {
  const status = (error as AuthError).response?.status
  return status === BAD_CREDENTIALS_STATUS ? MESSAGES.badCredentials : MESSAGES.loginFailed
}

function getDestination() {
  return props.destination
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function handleLoginSuccess(session: SessionResponse) {
  await queryClient.cancelQueries()
  queryClient.clear()
  queryClient.setQueryData(['auth', 'session'], session)
}

async function submitLogin() {
  if (login.isPending.value) return
  errorMessage.value = ''

  try {
    const session = await login.mutateAsync({
      email: email.value.trim(),
      password: password.value,
    })

    if (!session.meta.is_authenticated) {
      errorMessage.value = MESSAGES.loginIncomplete
      return
    }

    password.value = ''
    authenticated.value = true
    await router.replace(loginDestination.value)
  } catch (error) {
    errorMessage.value = getLoginErrorMessage(error)
  }
}
</script>

<template>
  <div>
    <UAlert
      v-if="authenticated"
      color="success"
      title="Sessão iniciada."
      description="Abrindo o painel do estúdio."
    />
    <form v-else class="space-y-5" @submit.prevent="submitLogin">
      <UAlert v-if="errorMessage" color="error" variant="subtle" :title="errorMessage" />
      <UFormField label="E-mail" required>
        <UInput
          v-model="email"
          type="email"
          autocomplete="username"
          placeholder="voce@email.com"
          size="lg"
          class="w-full"
          required
          :disabled="login.isPending.value"
        />
      </UFormField>
      <UFormField label="Senha" required>
        <UInput
          v-model="password"
          :type="passwordInputType"
          autocomplete="current-password"
          size="lg"
          class="w-full"
          required
          :disabled="login.isPending.value"
        >
          <template #trailing>
            <UTooltip :text="passwordToggleLabel">
              <UButton
                :icon="passwordToggleIcon"
                :aria-label="passwordToggleLabel"
                color="neutral"
                variant="ghost"
                @click="togglePasswordVisibility"
              />
            </UTooltip>
          </template>
        </UInput>
      </UFormField>
      <UButton
        type="submit"
        label="Entrar"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
        size="lg"
        block
        :loading="login.isPending.value"
        :disabled="!canSubmit"
      />
    </form>
  </div>
</template>
