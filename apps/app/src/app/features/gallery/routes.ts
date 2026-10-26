import type { RouteRecordRaw } from 'vue-router'

export const galleryRoutes: RouteRecordRaw[] = [
  {
    path: '/account/signup',
    redirect: (to) => ({ name: 'gallery.signup', query: to.query }),
  },
  {
    path: '/gallery/login',
    name: 'gallery.login',
    component: () => import('./pages/auth/gallery-login.vue'),
  },
  {
    path: '/gallery/signup',
    name: 'gallery.signup',
    component: () => import('./pages/auth/gallery-signup.vue'),
  },
  {
    path: '/auth/verify-email/:key',
    name: 'gallery.verify-email',
    component: () => import('./pages/auth/gallery-verify-email.vue'),
  },
  {
    path: '/g/:slug',
    component: () => import('./layouts/gallery-layout.vue'),
    children: [
      {
        path: '',
        name: 'gallery',
        component: () => import('./pages/gallery-slug.vue'),
      },
      {
        path: 'checkout',
        name: 'gallery.checkout',
        meta: { requiresAuth: true },
        component: () => import('./pages/gallery-checkout.vue'),
      },
      {
        path: 'purchases',
        name: 'gallery.purchases',
        meta: { requiresAuth: true },
        component: () => import('./pages/gallery-purchases.vue'),
      },
    ],
  },
]
