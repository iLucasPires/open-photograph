import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { getSession } from '@/app/shared/services/session'
import { authNavigationGuard } from './auth-guard'

vi.mock('@/app/shared/services/session', () => ({ getSession: vi.fn<typeof getSession>() }))

function makeRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/settings/drive', component: {} },
      { path: '/setup/drive', component: {} },
      { path: '/g/demo', component: {} },
      { path: '/g/demo/checkout', component: {}, meta: { requiresAuth: true } },
      { path: '/g/demo/purchases', component: {}, meta: { requiresAuth: true } },
      { path: '/admin/login', name: 'admin.login', component: {} },
      { path: '/gallery/login', name: 'gallery.login', component: {} },
    ],
  })
  router.beforeEach(authNavigationGuard)
  return router
}

describe('account navigation', () => {
  beforeEach(() => vi.resetAllMocks())

  it('redirects anonymous dashboard access to login and preserves the destination', async () => {
    vi.mocked(getSession).mockResolvedValue(null)
    const router = makeRouter()
    await router.push('/admin/settings/drive')
    expect(router.currentRoute.value.name).toBe('admin.login')
    expect(router.currentRoute.value.query.next).toBe('/admin/settings/drive')
  })

  it('allows authenticated dashboard access', async () => {
    vi.mocked(getSession).mockResolvedValue({ data: {}, meta: { is_authenticated: true } })
    const router = makeRouter()
    await router.push('/admin/settings/drive')
    expect(router.currentRoute.value.path).toBe('/admin/settings/drive')
  })

  it('keeps public galleries and login accessible without a session check', async () => {
    const router = makeRouter()
    await router.push('/g/demo')
    await router.push('/admin/login')
    await router.push('/gallery/login')
    expect(getSession).not.toHaveBeenCalled()
  })
  it('requires login for checkout and preserves purchase selection', async () => {
    vi.mocked(getSession).mockResolvedValue(null)
    const router = makeRouter()
    await router.push('/g/demo/checkout?photo=abc')
    expect(router.currentRoute.value.name).toBe('gallery.login')
    expect(router.currentRoute.value.query.next).toBe('/g/demo/checkout?photo=abc')
  })

  it('requires login for purchases', async () => {
    vi.mocked(getSession).mockResolvedValue(null)
    const router = makeRouter()
    await router.push('/g/demo/purchases')
    expect(router.currentRoute.value.query.next).toBe('/g/demo/purchases')
  })
})
