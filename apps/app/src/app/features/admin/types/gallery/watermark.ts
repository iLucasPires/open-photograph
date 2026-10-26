import type { z } from 'zod'
import type { watermarkSchema } from '../../schemas/gallery/watermark'

export type WatermarkFormState = z.infer<typeof watermarkSchema>

export interface WatermarkAsset extends WatermarkFormState {
  id: string
  logo: string | null
  is_default: boolean
}
