
import { z } from 'zod'

export const createTransferenciaSchema = z.object({
  cd_destino: z
    .string()
    .min(1, 'CD de destino é obrigatório'),
  ativos: z
    .array(z.object({
      tipo_ativo_id: z.string().min(1, 'Tipo de ativo é obrigatório'),
      quantidade: z.number().min(1, 'Quantidade deve ser maior que zero')
    }))
    .min(1, 'Pelo menos um ativo deve ser selecionado'),
  observacoes: z.string().optional()
})

export const updateTransferenciaStatusSchema = z.object({
  status: z.enum(['concluido', 'cancelado'], {
    required_error: 'Status é obrigatório'
  }),
  observacoes: z.string().optional()
})

export const transferenciaFiltersSchema = z.object({
  codigo: z.string().optional(),
  cd_destino: z.string().optional(),
  status: z.enum(['em_transito', 'concluido', 'cancelado', 'todos']).optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

export type CreateTransferenciaFormData = z.infer<typeof createTransferenciaSchema>
export type UpdateTransferenciaStatusFormData = z.infer<typeof updateTransferenciaStatusSchema>
export type TransferenciaFiltersData = z.infer<typeof transferenciaFiltersSchema>