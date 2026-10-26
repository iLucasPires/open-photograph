import type { Gallery } from '@/app/features/gallery/types'

export type GalleryTag = NonNullable<Gallery['tags']>[number]

export type ApiErrorItem = { detail: string }

export type ApiError = { data?: { errors?: ApiErrorItem[] } }
