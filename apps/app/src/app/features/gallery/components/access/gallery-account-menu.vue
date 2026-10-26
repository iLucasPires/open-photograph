<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getSession, endSession } from '@/app/shared/services/session'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const LOGIN_PATH = '/gallery/login'
const DEFAULT_ACCOUNT_LABEL = 'Sua conta'
const MENU_CONTENT = { align: 'end' } as const

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const route = useRoute()
const router = useRouter()
const toast = useToast()
const queryClient = useQueryClient()
const accountMenuTrigger = useTemplateRef<{ $el: HTMLElement }>('accountMenuTrigger')

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const { data: session, isPending } = useQuery({
  queryKey: ['auth', 'session'],
  queryFn: getSession,
  retry: false,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const accountMenuReference = computed(getAccountMenuReference)
const user = computed(getUser)
const loginRoute = computed(getLoginRoute)

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
const logout = useMutation({
  mutationFn: endSession,
  onSuccess: handleLogoutSuccess,
  onError: handleLogoutError,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const items = computed(getMenuItems)

// ---------------------------------------------------------------------------
// Funções
// ---------------------------------------------------------------------------

function requestLogout() {
  logout.mutate()
}

// ---------------------------------------------------------------------------
// Funções: computed
// ---------------------------------------------------------------------------

function getUser() {
  return session.value?.data.user
}

function getLoginRoute() {
  return {
    path: LOGIN_PATH,
    query: { next: route.fullPath },
  }
}

function getMenuItems() {
  return [
    {
      label: user.value?.display || DEFAULT_ACCOUNT_LABEL,
      type: 'label' as const,
    },
    {
      label: 'Minhas fotos',
      icon: 'i-lucide-shopping-bag',
      to: `/g/${route.params.slug}/purchases`,
    },
    { type: 'separator' as const },
    {
      label: 'Sair',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      disabled: logout.isPending.value,
      onSelect: requestLogout,
    },
  ]
}

function getAccountMenuReference() {
  return accountMenuTrigger.value?.$el
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function handleLogoutSuccess() {
  await queryClient.cancelQueries()
  queryClient.clear()
  await router.replace({ path: LOGIN_PATH, query: { next: `/g/${String(route.params.slug)}` } })
}

function handleLogoutError() {
  toast.add({
    title: 'Não foi possível sair. Tente novamente.',
    color: 'error',
  })
}
</script>

<template>
  <USkeleton v-if="isPending" class="size-8 rounded-full" />
  <UDropdownMenu v-else-if="user" :items="items" :content="MENU_CONTENT">
    <UButton
      ref="accountMenuTrigger"
      color="neutral"
      variant="ghost"
      aria-label="Abrir menu da conta"
      class="rounded-full p-1"
      :loading="logout.isPending.value"
    >
      <UAvatar :alt="user.display || user.email" size="sm" />
    </UButton>
  </UDropdownMenu>
  <UTooltip v-if="user" text="Abrir menu da conta" :reference="accountMenuReference" />
  <UButton
    v-else
    color="neutral"
    variant="ghost"
    label="Entrar"
    class="rounded-full"
    :to="loginRoute"
  >
    <template #leading>
      <UAvatar icon="i-lucide-user-round" size="xs" />
    </template>
  </UButton>
</template>
