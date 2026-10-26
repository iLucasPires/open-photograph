import type { Order } from './index'
import type { iApiPaginationNumber } from '@/app/shared/types'

export type OrdersPage = iApiPaginationNumber<Order>

export type OrdersQuery = { state: { data?: OrdersPage } }
