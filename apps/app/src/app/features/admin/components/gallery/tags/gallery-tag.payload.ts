import type { GalleryTag } from '@/app/features/gallery/types'
import { generateSimpleSlug } from '@/app/shared/utils'

export function galleryTagPayload(title: string, tags: GalleryTag[] = [], id?: string) {
  const trimmedTitle = title.trim()
  if (!trimmedTitle || trimmedTitle.length > 100) {
    throw new Error('Informe um nome com até 100 caracteres.')
  }
  const existing = tags?.find(
    (tag) => tag.id !== id && tag.title.toLocaleLowerCase() === trimmedTitle.toLocaleLowerCase(),
  )
  if (existing) throw new Error('Já existe uma tag com esse nome.')
  // Preserve an existing slug when renaming; generate a unique one when creating.
  const stem = generateSimpleSlug(trimmedTitle).slice(0, 100) || 'tag'
  const slug = tags?.some((tag) => tag.slug === stem)
    ? `${stem}-${crypto.randomUUID().slice(0, 8)}`
    : stem
  return id ? { title: trimmedTitle } : { title: trimmedTitle, slug }
}
