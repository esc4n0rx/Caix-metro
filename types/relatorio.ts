
export interface RelatorioEstatisticas {
  data: string
  total_movimentos: number
  remessas: number
  regressos: number
  transferencias: number
  movimentos_por_status: {
    em_transito: number
    concluido: number
    cancelado: number
  }
}

export interface RelatorioMovimento {
  id: string
  codigo: string
  tipo: 'remessa' | 'regresso' | 'transferencia'
  origem: string
  destino: string
  status: 'em_transito' | 'concluido' | 'cancelado'
  data_criacao: string
  data_atualizacao?: string
  usuario_nome: string
  usuario_cd: string
  ip_criacao: string
  observacoes?: string
  ativos: {
    id: string
    tipo_ativo_id: string
    tipo_ativo_nome: string
    tipo_ativo_codigo: string
    quantidade: number
  }[]
}

export interface RelatorioCompleto {
  estatisticas: RelatorioEstatisticas
  movimentos: RelatorioMovimento[]
  periodo: {
    data_inicio: string
    data_fim: string
  }
}

export interface RelatorioFilters {
  data_inicio?: string
  data_fim?: string
  tipo?: 'remessa' | 'regresso' | 'transferencia' | 'todos'
  status?: 'em_transito' | 'concluido' | 'cancelado' | 'todos'
  cd?: string
  loja?: string
}