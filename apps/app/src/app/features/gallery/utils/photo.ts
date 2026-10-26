import { apiFetch } from '@/app/core/clients'
import type { Gallery, PublicPhoto } from '../types'

export async function downloadPhoto(
  gallery: Pick<Gallery, 'slug'>,
  photo: PublicPhoto | null,
  original = false,
) {
  if (!photo || !(original ? photo.can_download_original : photo.can_download)) return

  const code = sessionStorage.getItem(`gallery-access:${gallery.slug}`) ?? ''

  const blob = await apiFetch<Blob, 'blob'>(
    `/api/galleries/public/${encodeURIComponent(gallery.slug)}/photos/${photo.id}/${original ? 'original' : 'download'}/`,
    {
      responseType: 'blob',
      headers: { 'X-Gallery-Access-Code': code },
    },
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `${photo.name.replace(/\.[^.]+$/, '')}.${original ? 'jpg' : 'webp'}`

  document.body.appendChild(anchor)

  anchor.click()
  anchor.remove()

  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
