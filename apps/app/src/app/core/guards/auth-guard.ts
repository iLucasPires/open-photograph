import type { NavigationGuard } from 'vue-router'
import { getSession } from '@/app/shared/services/session'

export const authNavigationGuard: NavigationGuard = async (to) => {
  if (to.name === 'admin.login' || to.path === '/admin/login') return
  const protectedPage =
    to.meta.requiresAuth ||
    to.path === '/admin' ||
    to.path.startsWith('/admin/') ||
    to.path.startsWith('/setup/')
  if (!protectedPage) return
  const session = await getSession()
  if (!session?.meta.is_authenticated) {
    return {
      name: to.path.startsWith('/g/') ? 'gallery.login' : 'admin.login',
      query: { next: to.fullPath },
    }
  }
}
