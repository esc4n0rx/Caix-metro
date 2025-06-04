export const lojas = [
  { id: "1", nome: "MACAE" },
  { id: "2", nome: "CABO FRIO" },
  { id: "3", nome: "CAMPOS" },
  { id: "4", nome: "GRAJAU" },
  { id: "5", nome: "BOTAFOGO" },
  { id: "6", nome: "TIJUCA" },
]

export const centrosDistribuicao = [
  { id: "1", nome: "CD PAVUNA" },
  { id: "2", nome: "CD SÃO PAULO" },
  { id: "3", nome: "CD ESPIRITO SANTO" },
]

export const tiposAtivos = [
  { id: "1", nome: "CAIXA HNT G", codigo: "CXG" },
  { id: "2", nome: "CAIXA HNT P", codigo: "CXP" },
  { id: "3", nome: "SACO BAG", codigo: "BAG" },
  { id: "4", nome: "PALLET PBR", codigo: "PLT" },
  { id: "5", nome: "CAIXA BASCULHANTE", codigo: "CXB" },
]

export interface Movimento {
  id: string
  codigo: string
  tipo: "remessa" | "regresso" | "transferencia"
  origem: string
  destino: string
  data: string
  status: "em_transito" | "concluido" | "pendente"
  ativos: { tipoId: string; quantidade: number }[]
  usuario: string
}

export const movimentos: Movimento[] = [
  {
    id: "1",
    codigo: "REM-001",
    tipo: "remessa",
    origem: "CD PAVUNA",
    destino: "BOTAFOGO",
    data: "2024-01-15",
    status: "concluido",
    ativos: [
      { tipoId: "1", quantidade: 50 },
      { tipoId: "3", quantidade: 100 },
    ],
    usuario: "João Silva",
  },
  {
    id: "2",
    codigo: "REG-001",
    tipo: "regresso",
    origem: "TIJUCA",
    destino: "CD PAVUNA",
    data: "2024-01-16",
    status: "em_transito",
    ativos: [
      { tipoId: "2", quantidade: 30 },
      { tipoId: "4", quantidade: 15 },
    ],
    usuario: "Maria Santos",
  },
]

export const usuarios = [
  { id: "1", nome: "João Silva", email: "joao@hortifruti.com", role: "admin" },
  { id: "2", nome: "Maria Santos", email: "maria@hortifruti.com", role: "operador" },
]
