import { useRoute, useRouter } from 'vue-router'

import type { SetupStatus } from '../types'

export function useSetupStepper(status: Ref<SetupStatus | undefined>) {
  const route = useRoute()
  const router = useRouter()

  const steps = computed(() => {
    const hasAdmin = !!status.value?.has_admin
    const hasDrive = !!status.value?.has_drive

    return [
      {
        slot: 'account',
        title: 'Sua conta',
        description: 'Acesso admin',
        icon: 'i-lucide-user-round',
        to: hasAdmin ? undefined : '/setup',
        disabled: hasAdmin,
      },
      {
        slot: 'drive',
        title: 'Drive',
        description: 'Armazenamento',
        icon: 'i-lucide-hard-drive',
        to: hasAdmin ? '/setup/drive' : undefined,
        disabled: !hasAdmin,
      },
      {
        slot: 'payment',
        title: 'Pagamento',
        description: 'Gateway',
        icon: 'i-lucide-credit-card',
        to: hasAdmin && hasDrive ? '/setup/payment' : undefined,
        disabled: !hasAdmin || !hasDrive,
      },
      {
        slot: 'done',
        title: 'Pronto',
        description: 'Concluído',
        icon: 'i-lucide-check-circle',
        to: hasAdmin && hasDrive ? '/setup/done' : undefined,
        disabled: !hasAdmin || !hasDrive,
      },
    ]
  })

  const ROUTE_TO_SLOT: Record<string, string> = {
    '/setup': 'account',
    '/setup/drive': 'drive',
    '/setup/payment': 'payment',
    '/setup/done': 'done',
  }

  const currentIndex = computed(() => {
    const slot = ROUTE_TO_SLOT[route.path] ?? 'account'
    const index = steps.value.findIndex((s) => s.slot === slot)
    return index !== -1 ? index : 0
  })

  function navigateToStep(value: string | number | undefined) {
    if (typeof value !== 'number') return

    const step = steps.value[value]
    if (!step || step.disabled || !step.to || step.to === route.path) return

    return router.push(step.to)
  }

  return {
    steps,
    currentIndex,
    navigateToStep,
  }
}
