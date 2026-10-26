export interface CreateOrderPayload {
  gallery_id?: string
  photo_ids?: string[]
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired'

export interface OrderPhoto {
  id: string
  name: string
  gallery_slug: string
  download_url: string | null
}

export interface Order {
  purchase_type?: 'package' | 'individual'
  id: string
  status: OrderStatus
  created_at: string
  photos: OrderPhoto[]
  checkout_url: string | null
  download_url: string | null
  total: string | null
  total_currency: string
}
