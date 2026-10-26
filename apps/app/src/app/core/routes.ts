import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// ----------------------------------------------------------------------------
// Features
// ----------------------------------------------------------------------------
import { setupRoutes } from '@/app/features/setup/routes'
import { adminRoutes } from '@/app/features/admin/routes'
import { galleryRoutes } from '@/app/features/gallery/routes'
import { authNavigationGuard } from './guards/auth-guard'
import { setUnauthorizedHandler } from './clients/api'

// ----------------------------------------------------------------------------
// Guards
// ----------------------------------------------------------------------------
import { setupNavigationGuard } from './guards/setup-guard'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/admin',
  },
  ...setupRoutes,
  ...adminRoutes,
  ...galleryRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ----------------------------------------------------------------------------
// Setup Guard: Controle de fluxo estrito para o onboarding
// ----------------------------------------------------------------------------
router.beforeEach(setupNavigationGuard)
router.beforeEach(authNavigationGuard)
setUnauthorizedHandler(() => {
  if (!['admin.login', 'gallery.login'].includes(String(router.currentRoute.value.name))) {
    void router.replace({
      name: router.currentRoute.value.path.startsWith('/g/') ? 'gallery.login' : 'admin.login',
      query: { next: router.currentRoute.value.fullPath },
    })
  }
})

export default router
