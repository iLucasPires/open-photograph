export interface PhotoComment {
  id: string
  photo: string
  photo_name: string
  name: string
  text: string
  created_at: string
}

export interface GallerySelection {
  id: string
  name: string
  email: string
  message: string
  photos: { id: string; name: string }[]
  created_at: string
}

export interface GalleryFeedback {
  like_counts: Record<string, number>
  liked_photo_ids: string[]
  comments: PhotoComment[]
  selections: GallerySelection[]
}

export interface AdminGalleryFeedback {
  likes: { id: string; name: string; count: number }[]
  comments: PhotoComment[]
  selections: GallerySelection[]
}
