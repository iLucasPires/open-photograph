import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from './layouts/admin-layout.vue'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/account/login',
    alias: '/auth/login',
    redirect: (to) => ({
      name:
        typeof to.query.next === 'string' && to.query.next.startsWith('/g/')
          ? 'gallery.login'
          : 'admin.login',
      query: to.query,
    }),
  },
  {
    path: '/admin/login',
    name: 'admin.login',
    component: () => import('./pages/admin-login.vue'),
  },
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/galleries',
    children: [
      {
        path: 'tags',
        name: 'admin.tags',
        component: () => import('./pages/tags.vue'),
      },
      {
        path: 'settings/previews',
        name: 'admin.settings.previews',
        component: () => import('./pages/settings/previews.vue'),
      },
      {
        path: 'sales',
        name: 'admin.sales',
        component: () => import('./pages/sales.vue'),
      },
      {
        path: 'clients',
        name: 'admin.clients',
        component: () => import('./pages/clients/index.vue'),
      },
      {
        path: 'galleries',
        name: 'admin.galleries',
        component: () => import('./pages/galleries/index.vue'),
      },
      {
        path: 'galleries/:galleryId/photos',
        name: 'admin.galleries.photos',
        component: () => import('./pages/galleries/photos.vue'),
      },
      {
        path: 'settings/drive',
        name: 'admin.settings.drive',
        component: () => import('./pages/settings/drive.vue'),
      },
      {
        path: 'settings/watermark',
        name: 'admin.settings.watermark',
        component: () => import('./pages/settings/watermark.vue'),
      },
      {
        path: 'settings/payment',
        name: 'admin.settings.payment',
        component: () => import('./pages/settings/payment.vue'),
      },
    ],
  },
]
