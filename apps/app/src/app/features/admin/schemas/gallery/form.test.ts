import { describe, expect, it } from 'vitest'
import { galleryFormSchema } from './form'
import type { GalleryFormState } from '../../types/gallery/form'
import { galleryPayload } from '../../utils/gallery/form'
import { generateSimpleSlug } from '@/app/shared/utils'

const state: GalleryFormState = {
  name: 'Ensaio',
  slug: 'ensaio',
  description: '',
  clients: [],
  theme: 'masonry',
  access_type: 'unlisted',
  access_code: '',
  allow_downloads: true,
  allow_likes: false,
  allow_comments: false,
  allow_selection: false,
  source_folder_id: '',
  watermark_enabled: false,
  enable_sales: false,
  included_photo_mode: 'none',
  included_photo_limit: 0,
  allow_individual_purchase: false,
  gallery_price_currency: 'BRL',
}

describe('gallery configuration', () => {
  it('all included disables sales even if the previous state had sales enabled', () => {
    expect(
      galleryPayload({ ...state, enable_sales: true, included_photo_mode: 'all' }),
    ).toMatchObject({
      included_photo_mode: 'all',
      enable_sales: false,
      allow_individual_purchase: false,
    })
  })
  it('requires a positive allowance and linked clients for client choices', () => {
    const clientMode = {
      ...state,
      enable_sales: true,
      allow_individual_purchase: true,
      included_photo_mode: 'client' as const,
      clients: ['client-id'],
      default_photo_price: 25,
    }
    expect(galleryFormSchema.safeParse({ ...clientMode, included_photo_limit: 0 }).success).toBe(
      false,
    )
    expect(galleryFormSchema.safeParse({ ...clientMode, included_photo_limit: 15 }).success).toBe(
      true,
    )
    expect(
      galleryFormSchema.safeParse({ ...clientMode, included_photo_limit: 15, clients: [] }).success,
    ).toBe(false)
  })
  it('preserves included delivery independently of extra sales', () => {
    expect(galleryPayload({ ...state, included_photo_mode: 'photographer' })).toMatchObject({
      enable_sales: false,
      included_photo_mode: 'photographer',
      included_photo_limit: 0,
    })
    expect(
      galleryPayload({
        ...state,
        included_photo_mode: 'client',
        included_photo_limit: 15,
        clients: ['client-id'],
      }),
    ).toMatchObject({
      enable_sales: false,
      included_photo_mode: 'client',
      included_photo_limit: 15,
    })
    expect(
      galleryFormSchema.safeParse({
        ...state,
        included_photo_mode: 'client',
        included_photo_limit: 15,
        clients: [],
      }).success,
    ).toBe(false)
  })
  it('ignores stale access codes for public galleries', () => {
    expect(
      galleryPayload({ ...state, access_type: 'public', access_code: '1234' }).access_code,
    ).toBeUndefined()
  })
  it('validates short access codes for private galleries', () => {
    expect(
      galleryFormSchema.safeParse({ ...state, access_type: 'private', access_code: '1234' })
        .success,
    ).toBe(false)
  })
  it('preserves client interaction settings in the payload', () => {
    expect(
      galleryPayload({ ...state, allow_likes: true, allow_comments: true, allow_selection: true }),
    ).toMatchObject({
      allow_likes: true,
      allow_comments: true,
      allow_selection: true,
    })
  })
  it('suggests a valid slug from a Portuguese title', () => {
    expect(generateSimpleSlug('  Casamento de João & Lívia! ')).toBe('casamento-de-joao-livia')
  })
  it('rejects missing names and invalid slugs', () => {
    expect(galleryFormSchema.safeParse({ ...state, name: '  ' }).success).toBe(false)
    expect(galleryFormSchema.safeParse({ ...state, slug: 'Ensaio com espaços' }).success).toBe(
      false,
    )
  })
  it('requires a sales price or individual purchase', () => {
    expect(galleryFormSchema.safeParse({ ...state, enable_sales: true }).success).toBe(false)
    expect(
      galleryFormSchema.safeParse({ ...state, enable_sales: true, allow_individual_purchase: true })
        .success,
    ).toBe(true)
  })
  it('sends decimal prices and omits an unchanged access code', () => {
    expect(galleryPayload({ ...state, enable_sales: true, gallery_price: 150.5 })).toMatchObject({
      gallery_price: '150.50',
      access_code: undefined,
    })
  })
  it('clears prices and individual sales when sales are disabled', () => {
    expect(
      galleryPayload({ ...state, gallery_price: 150, allow_individual_purchase: true }),
    ).toMatchObject({ gallery_price: null, allow_individual_purchase: false })
  })
})
