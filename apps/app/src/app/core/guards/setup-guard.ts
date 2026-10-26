import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export interface SetupStatus {
  needs_setup: boolean
  has_admin: boolean
  has_drive: boolean
  has_payment: boolean
}

let cachedStatus: SetupStatus | null = null
let lastFetchedAt = 0
const CACHE_TTL_MS = 5_000

export async function fetchSetupStatus(force = false): Promise<SetupStatus> {
  const now = Date.now()
  if (!force && cachedStatus && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedStatus
  }

  try {
    const res = await fetch('/api/setup/status/', { credentials: 'include' })
    if (res.ok) {
      cachedStatus = await res.json()
      lastFetchedAt = now
      return cachedStatus!
    }
  } catch {
    // Network fallback
  }

  return (
    cachedStatus || {
      needs_setup: false,
      has_admin: true,
      has_drive: true,
      has_payment: true,
    }
  )
}

export function invalidateSetupCache() {
  cachedStatus = null
  lastFetchedAt = 0
}

export async function setupNavigationGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  // 1. Galerias públicas (/g/:slug) são sempre liberadas
  if (to.path.startsWith('/g/')) {
    return next()
  }

  const status = await fetchSetupStatus()

  // 2. Se NÃO existe admin criado ainda:
  if (!status.has_admin) {
    // Bloqueia qualquer rota que não seja /setup
    if (to.path !== '/setup') {
      return next('/setup')
    }
    return next()
  }

  // 3. Se o admin JÁ EXISTE:
  // Bloqueia voltar para /setup (evita tentar recriar ou sobrescrever superusuário)
  if (to.path === '/setup') {
    if (!status.has_drive) {
      return next('/setup/drive')
    }
    if (!status.has_payment) {
      return next('/setup/payment')
    }
    return next('/admin')
  }

  // 4. Bloqueia pular etapas para frente sem o passo anterior:
  if (to.path === '/setup/payment' && !status.has_drive) {
    return next('/setup/drive')
  }

  // 5. Se tudo já foi configurado, bloqueia voltar para o wizard
  if (status.has_admin && status.has_drive && status.has_payment) {
    if (to.path.startsWith('/setup')) {
      return next('/admin')
    }
  }

  return next()
}
