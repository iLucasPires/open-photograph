import type { Gallery, PublicPhoto } from './index'

export type GalleryWithPhotos = Gallery & { photos: PublicPhoto[] }

export type LikeVariables = { photoId: string; liked: boolean }

export type CommentVariables = { photoId: string; text: string }

export type SelectionVariables = { email: string; message: string }

export type StatusError = { statusCode?: number }
