import { z } from 'zod'
import { galleryThemes } from '@/app/features/gallery/constants'

export const galleryFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome da galeria.').max(255),
    slug: z
      .string()
      .trim()
      .min(1, 'Informe o endereço.')
      .max(255)
      .regex(/^[a-z0-9_-]+$/, 'Use letras minúsculas, números e hífens.'),
    description: z.string(),
    clients: z.array(z.string()).default([]),
    theme: z.enum(galleryThemes.map((item) => item.value)),
    access_type: z.enum(['public', 'unlisted', 'private']),
    access_code: z.string().max(128),
    allow_downloads: z.boolean(),
    allow_likes: z.boolean().default(false),
    allow_comments: z.boolean().default(false),
    allow_selection: z.boolean().default(false),
    source_folder_id: z.string().trim().max(255),
    watermark_enabled: z.boolean(),
    enable_sales: z.boolean(),
    included_photo_mode: z.enum(['none', 'all', 'photographer', 'client']).default('none'),
    included_photo_limit: z.number().int().min(0).max(10000).default(0),
    allow_individual_purchase: z.boolean(),
    gallery_price: z
      .number()
      .positive('Informe um preço maior que zero.')
      .max(99999999.99)
      .optional(),
    gallery_price_currency: z.enum(['BRL', 'USD', 'EUR']),
    default_photo_price: z
      .number()
      .positive('Informe um preço maior que zero.')
      .max(99999999.99)
      .optional(),
  })
  .superRefine((values, context) => {
    if (
      values.enable_sales &&
      values.included_photo_mode === 'client' &&
      !values.default_photo_price
    ) {
      context.addIssue({
        code: 'custom',
        path: ['default_photo_price'],
        message: 'Defina o preço individual das fotos extras.',
      })
    }
    if (values.included_photo_mode === 'client' && !values.clients.length) {
      context.addIssue({
        code: 'custom',
        path: ['clients'],
        message: 'Vincule ao menos um cliente para usar a franquia.',
      })
    }
    if (values.included_photo_mode === 'client' && values.included_photo_limit < 1) {
      context.addIssue({
        code: 'custom',
        path: ['included_photo_limit'],
        message: 'Informe ao menos uma foto incluída.',
      })
    }
    if (values.access_type === 'private' && values.access_code && values.access_code.length < 6) {
      context.addIssue({
        code: 'custom',
        path: ['access_code'],
        message: 'Use pelo menos 6 caracteres.',
      })
    }
    if (
      values.enable_sales &&
      values.included_photo_mode !== 'all' &&
      !values.allow_individual_purchase &&
      values.gallery_price === undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['gallery_price'],
        message: 'Informe o preço do pacote ou habilite a venda individual.',
      })
    }
  })

export const galleryEditorSchema = galleryFormSchema.safeExtend({
  is_published: z.boolean(),
  watermark_asset: z.string().nullable(),
  tags: z.array(z.string()),
})

export function createGalleryEditorSchema(getPreviousAccessType: () => string | undefined) {
  return galleryEditorSchema.superRefine((values, context) => {
    const needsAccessCode =
      values.access_type === 'private' &&
      !values.access_code &&
      getPreviousAccessType() !== 'private'

    if (!needsAccessCode) return

    context.addIssue({
      code: 'custom',
      path: ['access_code'],
      message: 'Defina um código com pelo menos 6 caracteres.',
    })
  })
}
