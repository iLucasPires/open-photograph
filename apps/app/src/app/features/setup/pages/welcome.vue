<script setup lang="ts">
import { invalidateSetupCache } from '@/app/core/guards/setup-guard'
import { apiFetch } from '@/app/core/clients/api'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineOptions({ name: 'SetupWelcomePage' })
import type { AdminAccountPayload } from '../types'

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const toast = useToast()
const router = useRouter()
const queryClient = useQueryClient()

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------
const form = reactive<AdminAccountPayload>({
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
})
const showPassword = ref(false)

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const passwordsMatch = computed(getPasswordsMatch)
const canSubmit = computed(getCanSubmit)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const createAccount = useMutation({
  mutationFn: submitCreateAccount,
  onSuccess() {
    invalidateSetupCache()
    queryClient.invalidateQueries({ queryKey: ['setup', 'status'] })
    toast.add({ title: 'Conta criada! Agora conecte seu armazenamento.', color: 'success' })
    router.push('/setup/drive')
  },
  onError(error: { data?: { detail?: string; email?: string[]; confirm_password?: string[] } }) {
    const message =
      error?.data?.email?.[0] ??
      error?.data?.confirm_password?.[0] ??
      error?.data?.detail ??
      'Erro ao criar a conta. Verifique os dados e tente novamente.'
    toast.add({ title: message, color: 'error' })
  },
})

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getPasswordsMatch() {
  return !form.confirm_password || form.password === form.confirm_password
}

function getCanSubmit() {
  return (
    form.full_name.trim().length >= 2 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.password === form.confirm_password
  )
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

function handleSubmit() {
  if (!canSubmit.value || createAccount.isPending.value) return
  createAccount.mutate({ ...form })
}

function submitCreateAccount(payload: AdminAccountPayload) {
  return apiFetch('/api/photographer/', { method: 'POST', body: payload })
}
</script>

<template>
  <CSetupPage
    title="Crie sua conta"
    description="Seu acesso para gerenciar galerias, fotos e clientes."
  >
    <div class="flex flex-col gap-5">
      <UFormField label="Seu nome completo" required>
        <UInput
          id="setup-full-name"
          v-model="form.full_name"
          placeholder="João Silva"
          leading-icon="i-lucide-user"
          autocomplete="name"
          class="w-full"
          size="lg"
          :disabled="createAccount.isPending.value"
        />
      </UFormField>

      <!-- E-mail -->
      <UFormField label="E-mail" required>
        <UInput
          id="setup-email"
          v-model="form.email"
          type="email"
          placeholder="voce@email.com"
          leading-icon="i-lucide-mail"
          autocomplete="email"
          class="w-full"
          size="lg"
          :disabled="createAccount.isPending.value"
        />
      </UFormField>

      <!-- Senha -->
      <UFormField label="Senha" hint="Mínimo 8 caracteres" required>
        <UInput
          id="setup-password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          leading-icon="i-lucide-lock"
          autocomplete="new-password"
          class="w-full"
          size="lg"
          :disabled="createAccount.isPending.value"
        />
      </UFormField>

      <!-- Confirmar senha -->
      <UFormField
        label="Confirme a senha"
        :error="!passwordsMatch ? 'As senhas não coincidem' : undefined"
        required
      >
        <UInput
          id="setup-confirm-password"
          v-model="form.confirm_password"
          type="password"
          placeholder="••••••••"
          leading-icon="i-lucide-lock-keyhole"
          autocomplete="new-password"
          class="w-full"
          size="lg"
          :disabled="createAccount.isPending.value"
          :color="!passwordsMatch ? 'error' : undefined"
        />
      </UFormField>

      <!-- Aviso de segurança -->
      <UAlert
        icon="i-lucide-shield-check"
        color="info"
        variant="subtle"
        title="Somente você terá acesso"
        description="Esta é a conta principal de administrador. Guarde as credenciais em local seguro."
      />

      <!-- Botão -->
      <UButton
        id="setup-create-account-btn"
        label="Criar conta e continuar"
        trailing-icon="i-lucide-arrow-right"
        size="lg"
        block
        :loading="createAccount.isPending.value"
        :disabled="!canSubmit"
        @click="handleSubmit"
      />
    </div>
  </CSetupPage>
</template>
