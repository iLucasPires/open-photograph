import type { iApiPaginationNumber } from '@/app/shared/types'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  notes: string
}

export type ClientList = iApiPaginationNumber<Client>
