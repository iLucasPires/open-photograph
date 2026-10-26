import { z } from 'zod'

export const watermarkSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome.').max(100),
  style: z.enum(['text_diagonal', 'image_overlay', 'combined']),
  text: z.string().trim().max(200),
  text_color: z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use uma cor como #FFFFFF.'),
  text_opacity: z.number().min(0).max(1),
  font_size_ratio: z.number().min(0.001).max(1),
  rotation_angle: z.number().int().min(-360).max(360),
  tile_spacing: z.number().int().min(10).max(2000),
  logo_opacity: z.number().min(0).max(1),
  logo_size_ratio: z.number().min(0.001).max(1),
  logo_position: z.enum(['top_left', 'top_right', 'bottom_left', 'bottom_right', 'center']),
})
