import type { GalleryTheme } from '../constants'

export interface GalleryTag {
  id: string
  title: string
  slug: string
}

export type GalleryAccessType = 'public' | 'unlisted' | 'private'

export interface Gallery {
  id: string
  name: string
  slug: string
  description: string
  theme: GalleryTheme
  access_type: GalleryAccessType
  is_published: boolean
  allow_downloads: boolean
  allow_likes: boolean
  allow_comments: boolean
  allow_selection: boolean
  enable_sales: boolean
  included_photo_mode?: 'none' | 'all' | 'photographer' | 'client'
  included_photo_limit?: number
  included_remaining?: number
  included_used?: number
  included_eligible?: boolean
  allow_individual_purchase: boolean
  gallery_price: string | null
  package_discount?: string
  package_remaining?: string
  default_photo_price: string | null
  gallery_price_currency: string
  watermark_enabled: boolean
  watermark_asset: string | null
  source_folder_id: string
  last_synced_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  clients: string[]
  tags: GalleryTag[]
}
