import { z } from 'zod'

export const createRemessaSchema = z.object({
  loja_destino: z
    .string()
    .min(1, 'Loja de destino é obrigatória'),
  ativos: z
    .array(z.object({
      tipo_ativo_id: z.string().min(1, 'Tipo de ativo é obrigatório'),
      quantidade: z.number().min(1, 'Quantidade deve ser maior que zero')
    }))
    .min(1, 'Pelo menos um ativo deve ser selecionado'),
  observacoes: z.string().optional()
})

export const updateRemessaStatusSchema = z.object({
  status: z.enum(['concluido', 'cancelado'], {
    required_error: 'Status é obrigatório'
  }),
  observacoes: z.string().optional()
})

export const remessaFiltersSchema = z.object({
  codigo: z.string().optional(),
  loja_destino: z.string().optional(),
  status: z.enum(['em_transito', 'concluido', 'cancelado', 'todos']).optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

export type CreateRemessaFormData = z.infer<typeof createRemessaSchema>
export type UpdateRemessaStatusFormData = z.infer<typeof updateRemessaStatusSchema>
export type RemessaFiltersData = z.infer<typeof remessaFiltersSchema>