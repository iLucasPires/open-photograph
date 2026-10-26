<script setup lang="ts">
import { getSession, endSession } from '@/app/shared/services/session'
import { useMutation, useQueryClient, useQuery } from '@tanstack/vue-query'
import type { DropdownMenuItem } from '@nuxt/ui'

// ---------------------------------------------------------------------------
// Contrato do componente
// ---------------------------------------------------------------------------
defineProps<{ collapsed?: boolean }>()

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const LOGIN_PATH = '/admin/login'
const DEFAULT_ACCOUNT_LABEL = 'Sua conta'
const MENU_CONTENT = { align: 'start', side: 'top' } as const

// ---------------------------------------------------------------------------
// Composables
// ---------------------------------------------------------------------------
const queryClient = useQueryClient()
const router = useRouter()
const toast = useToast()
const accountMenuTrigger = useTemplateRef<{ $el: HTMLElement }>('accountMenuTrigger')

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
const sessionQuery = useQuery({
  queryKey: ['auth', 'session'],
  queryFn: getSession,
  retry: false,
})

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------
const user = computed(getUser)
const userLabel = computed(getUserLabel)
const accountMenuReference = computed(getAccountMenuReference)

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
const items = computed<DropdownMenuItem[]>(getMenuItems)

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
  return sessionQuery.data.value?.data.user ?? null
}

function getUserLabel() {
  return user.value?.display || user.value?.email || ''
}

function getAccountMenuReference() {
  return accountMenuTrigger.value?.$el
}

function getMenuItems(): DropdownMenuItem[] {
  return [
    { label: user.value?.email || DEFAULT_ACCOUNT_LABEL, type: 'label' },
    { type: 'separator' },
    {
      label: 'Sair',
      icon: 'i-lucide-log-out',
      color: 'error',
      disabled: logout.isPending.value,
      onSelect: requestLogout,
    },
  ]
}

// ---------------------------------------------------------------------------
// Funções: mutations
// ---------------------------------------------------------------------------

async function handleLogoutSuccess() {
  await queryClient.cancelQueries()
  queryClient.clear()
  await router.replace(LOGIN_PATH)
}

function handleLogoutError() {
  toast.add({ title: 'Não foi possível sair. Tente novamente.', color: 'error' })
}
</script>

<template>
  <USkeleton v-if="sessionQuery.isPending.value" class="h-10 w-full rounded-lg" />
  <UDropdownMenu v-else-if="user" :items="items" :content="MENU_CONTENT">
    <UButton
      ref="accountMenuTrigger"
      color="neutral"
      variant="ghost"
      size="md"
      block
      :aria-label="collapsed ? 'Menu da conta' : undefined"
      :loading="logout.isPending.value"
      class="justify-start"
    >
      <UAvatar :alt="userLabel" size="xs" />
      <span v-if="!collapsed" class="min-w-0 flex-1 truncate text-left">{{ userLabel }}</span>
      <UIcon v-if="!collapsed" name="i-lucide-chevrons-up-down" class="size-4 shrink-0" />
    </UButton>
  </UDropdownMenu>
  <UTooltip v-if="user && collapsed" text="Menu da conta" :reference="accountMenuReference" />
</template>
