
import { z } from 'zod'

export const relatorioFiltersSchema = z.object({
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  tipo: z.enum(['remessa', 'regresso', 'transferencia', 'todos']).optional(),
  status: z.enum(['em_transito', 'concluido', 'cancelado', 'todos']).optional(),
  cd: z.string().optional(),
  loja: z.string().optional()
})

export type RelatorioFiltersData = z.infer<typeof relatorioFiltersSchema>