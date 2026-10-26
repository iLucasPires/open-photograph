import type { Gallery, PublicPhoto } from './index'

export type GalleryWithPhotos = Gallery & { photos: PublicPhoto[] }

export type CheckoutErrorItem = { detail: string; code?: string }

export type CheckoutError = {
  data?: { errors?: CheckoutErrorItem[]; detail?: string }
}
