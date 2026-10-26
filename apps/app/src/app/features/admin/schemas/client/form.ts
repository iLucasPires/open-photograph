import { z } from 'zod'

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(255),
  email: z.email('Informe um email válido.'),
  phone: z.string().max(30),
  notes: z.string(),
})
