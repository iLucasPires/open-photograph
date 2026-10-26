import type { RouteRecordRaw } from 'vue-router'
import SetupLayout from './components/setup-layout.vue'
import WelcomePage from './pages/welcome.vue'
import DrivePage from './pages/drive.vue'
import PaymentPage from './pages/payment.vue'
import DonePage from './pages/done.vue'

export const setupRoutes: RouteRecordRaw[] = [
  {
    path: '/setup',
    component: SetupLayout,
    children: [
      {
        path: '',
        name: 'setup.welcome',
        component: WelcomePage,
      },
      {
        path: 'drive',
        name: 'setup.drive',
        component: DrivePage,
      },
      {
        path: 'payment',
        name: 'setup.payment',
        component: PaymentPage,
      },
      {
        path: 'done',
        name: 'setup.done',
        component: DonePage,
      },
    ],
  },
]
