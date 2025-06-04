// types/upload.ts
export interface UploadMovimento {
  tipo: 'remessa' | 'regresso' | 'transferencia'
  origem: string
  destino: string
  observacoes?: string
  ativos: {
    tipo_ativo: string
    quantidade: number
  }[]
}

export interface ProcessedMovimento extends UploadMovimento {
  linha: number
  erros: string[]
  origem_matched?: string
  destino_matched?: string
}

export interface UploadResult {
  success: boolean
  total_linhas: number
  movimentos_processados: number
  movimentos_criados: number
  erros: {
    linha: number
    erros: string[]
  }[]
}

export interface UploadProgress {
  total: number
  current: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  message: string
}