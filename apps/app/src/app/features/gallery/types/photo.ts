export type PhotoStatus = 'processing' | 'ready' | 'failed'
export type PhotoDownloadPolicy = 'inherit' | 'allow' | 'deny'

export interface Photo {
  id: string
  gallery: string
  source_file_id: string
  name: string
  thumbnail: string | null
  preview: string | null
  watermarked_preview: string | null
  width: number | null
  height: number | null
  size: number | null
  mime_type: string
  status: PhotoStatus
  position: number
  is_active: boolean
  download_policy: PhotoDownloadPolicy
  can_download: boolean
  can_download_original?: boolean
  is_included?: boolean
  price: string | null
  price_currency: string
  taken_at: string | null
  created_at: string
  updated_at: string
}

export type PublicPhoto = Omit<Photo, 'source_file_id' | 'is_active' | 'download_policy'>
