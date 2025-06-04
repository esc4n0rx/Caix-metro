// types/regresso.ts
export interface Regresso {
  id: string
  codigo: string
  loja_origem: string
  cd_destino: string
  status: 'em_transito' | 'concluido' | 'cancelado'
  usuario_id: string
  usuario_nome: string
  data_criacao: string
  data_atualizacao?: string
  observacoes?: string
  ip_criacao: string
  ativos: RegressoAtivo[]
}

export interface RegressoAtivo {
  id: string
  regresso_id: string
  tipo_ativo_id: string
  tipo_ativo_nome: string
  tipo_ativo_codigo: string
  quantidade: number
}

export interface CreateRegressoData {
  loja_origem: string
  ativos: {
    tipo_ativo_id: string
    quantidade: number
  }[]
  observacoes?: string
}

export interface UpdateRegressoStatusData {
  status: 'concluido' | 'cancelado'
  observacoes?: string
}