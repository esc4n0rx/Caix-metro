export interface Remessa {
  id: string
  codigo: string
  cd_origem: string
  loja_destino: string
  data_criacao: string
  data_atualizacao: string
  status: 'em_transito' | 'concluido' | 'cancelado'
  ativos: AtivoRemessa[]
  usuario_id: string
  usuario_nome: string
  ip_criacao?: string
  observacoes?: string
}

export interface AtivoRemessa {
  id: string
  tipo_ativo_id: string
  tipo_ativo_nome: string
  tipo_ativo_codigo: string
  quantidade: number
}

export interface CreateRemessaData {
  loja_destino: string
  ativos: { tipo_ativo_id: string; quantidade: number }[]
  observacoes?: string
}

export interface UpdateRemessaStatusData {
  status: 'concluido' | 'cancelado'
  observacoes?: string
}