export const lojas = [
  { id: "1", nome: "MACAE" },
  { id: "2", nome: "CABO FRIO" },
  { id: "3", nome: "CAMPOS" },
  { id: "4", nome: "GRAJAU" },
  { id: "5", nome: "BOTAFOGO" },
  { id: "6", nome: "TIJUCA" },
  { id: "7", nome: "VILA ISABEL" },
  { id: "8", nome: "FLAMENGO" },
  { id: "9", nome: "DIAS DA ROCHA" },
  { id: "10", nome: "ICARAI" },
  { id: "11", nome: "SIQUEIRA CAMPOS" },
  { id: "12", nome: "LEBLON" },
  { id: "13", nome: "MARQUES DE PARANA" },
  { id: "14", nome: "PRADO JUNIOR" },
  { id: "15", nome: "BARRA" },
  { id: "16", nome: "REGIAO OCEANICA" },
  { id: "17", nome: "LARANJEIRAS" },
  { id: "18", nome: "PRAIA DO SUA" },
  { id: "19", nome: "RECREIO" },
  { id: "20", nome: "AV DAS AMERICAS" },
  { id: "21", nome: "URUGUAI" },
  { id: "22", nome: "ILHA DO GOVERNADOR" },
  { id: "23", nome: "ADALBERTO FERREIRA" },
  { id: "24", nome: "MARQUES DE ABRANTES" },
  { id: "25", nome: "RIO DAS OSTRAS" },
  { id: "26", nome: "VILA VELHA" },
  { id: "27", nome: "SANTA ROSA" },
  { id: "28", nome: "VOLUNTARIOS DA PATRIA" },
  { id: "29", nome: "BARRA GARDEN" },
  { id: "30", nome: "BARRA BLUE" },
  { id: "31", nome: "ABELARDO BUENO" },
  { id: "32", nome: "GAVEA" },
  { id: "33", nome: "INGA" },
  { id: "34", nome: "ATAULFO DE PAIVA" },
  { id: "35", nome: "VISCONDE DE PIRAJA" },
  { id: "36", nome: "RECREIO A5" },
  { id: "37", nome: "SAO CONRADO" },
  { id: "38", nome: "JUIZ DE FORA" },
  { id: "39", nome: "SAO FRANCISCO XAVIER" },
  { id: "40", nome: "MARIZ E BARROS" },
  { id: "41", nome: "CONDE DE BONFIM" },
  { id: "42", nome: "MOREIRA CESAR" },
  { id: "43", nome: "ITAIPU" },
  { id: "44", nome: "CARLOS GOIS" },
  { id: "45", nome: "MARACANA" },
  { id: "46", nome: "CONDE 648" },
  { id: "47", nome: "HUMAITA" },
  { id: "48", nome: "JARDIM BOTANICO" },
  { id: "49", nome: "ATERRADO" },
  { id: "50", nome: "FREGUESIA" },
  { id: "51", nome: "CONDE 99" },
  { id: "52", nome: "CATETE" },
  { id: "53", nome: "MARIZ 1083" },
  { id: "54", nome: "VOLUNTARIOS 157" },
  { id: "55", nome: "PASSAGEM" },
  { id: "56", nome: "MARIZ 312 NITEROI" },
  { id: "57", nome: "CAMPO GRANDE" },
  { id: "58", nome: "BUZIOS" },
  { id: "59", nome: "LARANJEIRAS 49" },
  { id: "60", nome: "PARAISO" },
  { id: "61", nome: "SANTOS" },
  { id: "62", nome: "VILA MADALENA" },
  { id: "63", nome: "INTERLAGOS" },
  { id: "64", nome: "NHAMBIQUARAS" },
  { id: "65", nome: "ROSA E SILVA" },
  { id: "66", nome: "BROOKLIN" },
  { id: "67", nome: "VERBO DIVINO" },
  { id: "68", nome: "IPIRANGA" },
  { id: "69", nome: "JOAO CACHOEIRA" },
  { id: "70", nome: "ARAPANES" },
  { id: "71", nome: "VILA MARIANA" },
  { id: "72", nome: "VILA MASCOTE" },
  { id: "73", nome: "SBC KENNEDY" },
  { id: "74", nome: "VILA OLIMPIA" },
  { id: "75", nome: "BARRA DA TIJUCA" },
  { id: "76", nome: "PQ TAMANDARE" }
]

export const centrosDistribuicao = [
  { id: "1", nome: "CD PAVUNA" },
  { id: "2", nome: "CD SÃO PAULO" },
  { id: "3", nome: "CD ESPIRITO SANTO" },
]

export const tiposAtivos = [
  { id: "cxativo_tipo_1", nome: "CAIXA HNT G", codigo: "CXG" },
  { id: "cxativo_tipo_2", nome: "CAIXA HNT P", codigo: "CXP" },
  { id: "cxativo_tipo_3", nome: "SACO BAG", codigo: "BAG" },
  { id: "cxativo_tipo_4", nome: "PALLET PBR", codigo: "PLT" },
  { id: "cxativo_tipo_5", nome: "CAIXA BASCULHANTE", codigo: "CXB" },
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
      { tipoId: "cxativo_tipo_1", quantidade: 50 },
      { tipoId: "cxativo_tipo_3", quantidade: 100 },
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
      { tipoId: "cxativo_tipo_2", quantidade: 30 },
      { tipoId: "cxativo_tipo_4", quantidade: 15 },
    ],
    usuario: "Maria Santos",
  },
]

export const usuarios = [
  { id: "1", nome: "João Silva", email: "joao@hortifruti.com", role: "admin" },
  { id: "2", nome: "Maria Santos", email: "maria@hortifruti.com", role: "operador" },
]