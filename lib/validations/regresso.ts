
import { z } from 'zod'

export const createRegressoSchema = z.object({
  loja_origem: z
    .string()
    .min(1, 'Loja de origem é obrigatória'),
  ativos: z
    .array(z.object({
      tipo_ativo_id: z.string().min(1, 'Tipo de ativo é obrigatório'),
      quantidade: z.number().min(1, 'Quantidade deve ser maior que zero')
    }))
    .min(1, 'Pelo menos um ativo deve ser selecionado'),
  observacoes: z.string().optional()
})

export const updateRegressoStatusSchema = z.object({
  status: z.enum(['concluido', 'cancelado'], {
    required_error: 'Status é obrigatório'
  }),
  observacoes: z.string().optional()
})

export const regressoFiltersSchema = z.object({
  codigo: z.string().optional(),
  loja_origem: z.string().optional(),
  status: z.enum(['em_transito', 'concluido', 'cancelado', 'todos']).optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

export type CreateRegressoFormData = z.infer<typeof createRegressoSchema>
export type UpdateRegressoStatusFormData = z.infer<typeof updateRegressoStatusSchema>
export type RegressoFiltersData = z.infer<typeof regressoFiltersSchema>