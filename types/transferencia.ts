
export interface Transferencia {
  id: string
  codigo: string
  cd_origem: string
  cd_destino: string
  status: 'em_transito' | 'concluido' | 'cancelado'
  usuario_id: string
  usuario_nome: string
  data_criacao: string
  data_atualizacao?: string
  observacoes?: string
  ip_criacao: string
  ativos: TransferenciaAtivo[]
}

export interface TransferenciaAtivo {
  id: string
  transferencia_id: string
  tipo_ativo_id: string
  tipo_ativo_nome: string
  tipo_ativo_codigo: string
  quantidade: number
}

export interface CreateTransferenciaData {
  cd_destino: string
  ativos: {
    tipo_ativo_id: string
    quantidade: number
  }[]
  observacoes?: string
}

export interface UpdateTransferenciaStatusData {
  status: 'concluido' | 'cancelado'
  observacoes?: string
}