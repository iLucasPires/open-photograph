import type { z } from 'zod'
import type { galleryFormSchema, galleryEditorSchema } from '../../schemas/gallery/form'

export type GalleryFormState = z.infer<typeof galleryFormSchema>

export type GalleryEditorState = z.infer<typeof galleryEditorSchema>

export type GalleryPayload = Omit<
  GalleryFormState,
  'gallery_price' | 'access_code' | 'default_photo_price'
> & {
  default_photo_price: string | null
  gallery_price: string | null
  access_code?: string
}
