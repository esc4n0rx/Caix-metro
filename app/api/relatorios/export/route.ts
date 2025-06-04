// app/api/relatorios/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { relatorioFiltersSchema } from '@/lib/validations/relatorio'
import * as XLSX from 'xlsx'
import { RelatorioEstatisticas, RelatorioMovimento } from '@/types/relatorio'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token não fornecido' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const formato = searchParams.get('formato') || 'xlsx'
    const filters = {
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      tipo: searchParams.get('tipo') || undefined,
      status: searchParams.get('status') || undefined,
      cd: searchParams.get('cd') || undefined,
      loja: searchParams.get('loja') || undefined
    }

    // Reutilizar a lógica da API de relatórios
    const relatorioCompleto = await buscarDadosRelatorio(filters)

    if (formato === 'xlsx') {
      return gerarExcelResponse(relatorioCompleto, filters)
    } else if (formato === 'csv') {
      return gerarCSVResponse(relatorioCompleto, filters)
    } else {
      return NextResponse.json({
        success: false,
        message: 'Formato não suportado'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro na exportação de relatório:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

async function buscarDadosRelatorio(filters: any) {
  // Reutilizar a mesma lógica da API principal de relatórios
  const hoje = new Date().toISOString().split('T')[0]
  const periodo_inicio = filters.data_inicio || hoje
  const periodo_fim = filters.data_fim || hoje

  const movimentos = await buscarMovimentosDetalhados(periodo_inicio, periodo_fim, filters)
  const estatisticas = await buscarEstatisticas(periodo_inicio, periodo_fim, filters)

  return {
    estatisticas,
    movimentos,
    periodo: {
      data_inicio: periodo_inicio,
      data_fim: periodo_fim
    }
  }
}

function gerarExcelResponse(dados: any, filters: any) {
  const workbook = XLSX.utils.book_new()

  // Aba 1: Estatísticas
  const estatisticasData = [
    ['Relatório de Movimentos'],
    [''],
    ['Período:', `${dados.periodo.data_inicio} a ${dados.periodo.data_fim}`],
    [''],
    ['ESTATÍSTICAS GERAIS'],
    ['Total de Movimentos:', dados.estatisticas.total_movimentos],
    ['Remessas:', dados.estatisticas.remessas],
    ['Regressos:', dados.estatisticas.regressos],
    ['Transferências:', dados.estatisticas.transferencias],
    [''],
    ['POR STATUS'],
    ['Em Trânsito:', dados.estatisticas.movimentos_por_status.em_transito],
    ['Concluído:', dados.estatisticas.movimentos_por_status.concluido],
    ['Cancelado:', dados.estatisticas.movimentos_por_status.cancelado]
  ]

  const wsEstatisticas = XLSX.utils.aoa_to_sheet(estatisticasData)
  XLSX.utils.book_append_sheet(workbook, wsEstatisticas, 'Estatísticas')

  // Aba 2: Movimentos Detalhados
  const movimentosHeaders = [
    'Código',
    'Tipo',
    'Origem',
    'Destino',
    'Status',
    'Data Criação',
    'Data Atualização',
    'Usuário',
    'CD do Usuário',
    'IP Criação',
    'Observações',
    'Qtd Tipos Ativos',
    'Detalhes Ativos'
  ]

  const movimentosData = dados.movimentos.map((movimento: any) => {
    const detalhesAtivos = movimento.ativos.map((ativo: any) => 
      `${ativo.tipo_ativo_nome} (${ativo.tipo_ativo_codigo}): ${ativo.quantidade}`
    ).join('; ')

    return [
      movimento.codigo,
      movimento.tipo.toUpperCase(),
      movimento.origem,
      movimento.destino,
      movimento.status.replace('_', ' ').toUpperCase(),
      new Date(movimento.data_criacao).toLocaleString('pt-BR'),
      movimento.data_atualizacao ? new Date(movimento.data_atualizacao).toLocaleString('pt-BR') : '',
      movimento.usuario_nome,
      movimento.usuario_cd,
      movimento.ip_criacao,
      movimento.observacoes || '',
      movimento.ativos.length,
      detalhesAtivos
    ]
  })

  const wsMovimentos = XLSX.utils.aoa_to_sheet([movimentosHeaders, ...movimentosData])
  XLSX.utils.book_append_sheet(workbook, wsMovimentos, 'Movimentos')

  // Aba 3: Ativos Detalhados
  const ativosHeaders = [
    'Código Movimento',
    'Tipo Movimento',
    'Tipo Ativo',
    'Código Ativo',
    'Quantidade',
    'Origem',
    'Destino',
    'Status',
    'Data',
    'Usuário'
  ]

  const ativosData: any[] = []
  dados.movimentos.forEach((movimento: any) => {
    movimento.ativos.forEach((ativo: any) => {
      ativosData.push([
        movimento.codigo,
        movimento.tipo.toUpperCase(),
        ativo.tipo_ativo_nome,
        ativo.tipo_ativo_codigo,
        ativo.quantidade,
        movimento.origem,
        movimento.destino,
        movimento.status.replace('_', ' ').toUpperCase(),
        new Date(movimento.data_criacao).toLocaleDateString('pt-BR'),
        movimento.usuario_nome
      ])
    })
  })

  const wsAtivos = XLSX.utils.aoa_to_sheet([ativosHeaders, ...ativosData])
  XLSX.utils.book_append_sheet(workbook, wsAtivos, 'Ativos Detalhados')

  // Gerar arquivo
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  
  const filename = `relatorio_movimentos_${dados.periodo.data_inicio}_${dados.periodo.data_fim}.xlsx`
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}

function gerarCSVResponse(dados: any, filters: any) {
  // Gerar CSV com movimentos detalhados
  const headers = [
    'Código',
    'Tipo',
    'Origem',
    'Destino',
    'Status',
    'Data Criação',
    'Data Atualização',
    'Usuário',
    'CD do Usuário',
    'IP Criação',
    'Observações',
    'Detalhes Ativos'
  ]

  const csvData = dados.movimentos.map((movimento: any) => {
    const detalhesAtivos = movimento.ativos.map((ativo: any) => 
      `${ativo.tipo_ativo_nome} (${ativo.tipo_ativo_codigo}): ${ativo.quantidade}`
    ).join('; ')

    return [
      movimento.codigo,
      movimento.tipo.toUpperCase(),
      movimento.origem,
      movimento.destino,
      movimento.status.replace('_', ' ').toUpperCase(),
      new Date(movimento.data_criacao).toLocaleString('pt-BR'),
      movimento.data_atualizacao ? new Date(movimento.data_atualizacao).toLocaleString('pt-BR') : '',
      movimento.usuario_nome,
      movimento.usuario_cd,
      movimento.ip_criacao,
      `"${movimento.observacoes || ''}"`,
      `"${detalhesAtivos}"`
    ]
  })

  const csvContent = [
    headers.join(','),
    ...csvData.map((row: any[]) => row.join(','))
  ].join('\n')

  const filename = `relatorio_movimentos_${dados.periodo.data_inicio}_${dados.periodo.data_fim}.csv`

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}

async function buscarEstatisticas(
  data_inicio: string, 
  data_fim: string, 
  filtros: { tipo?: string, status?: string, cd?: string, loja?: string }
): Promise<RelatorioEstatisticas> {
  const { tipo, status, cd, loja } = filtros

  // Buscar remessas
  let queryRemessas = supabaseAdmin
    .from('cxativo_remessas')
    .select('status', { count: 'exact' })
    .gte('data_criacao', `${data_inicio}T00:00:00`)
    .lte('data_criacao', `${data_fim}T23:59:59`)

  if (status && status !== 'todos') {
    queryRemessas = queryRemessas.eq('status', status)
  }
  if (cd) {
    queryRemessas = queryRemessas.eq('cd_origem', cd)
  }
  if (loja) {
    queryRemessas = queryRemessas.eq('loja_destino', loja)
  }

  // Buscar regressos
  let queryRegressos = supabaseAdmin
    .from('cxativo_regressos')
    .select('status', { count: 'exact' })
    .gte('data_criacao', `${data_inicio}T00:00:00`)
    .lte('data_criacao', `${data_fim}T23:59:59`)

  if (status && status !== 'todos') {
    queryRegressos = queryRegressos.eq('status', status)
  }
  if (cd) {
    queryRegressos = queryRegressos.eq('cd_destino', cd)
  }
  if (loja) {
    queryRegressos = queryRegressos.eq('loja_origem', loja)
  }

  // Buscar transferências
  let queryTransferencias = supabaseAdmin
    .from('cxativo_transferencias')
    .select('status', { count: 'exact' })
    .gte('data_criacao', `${data_inicio}T00:00:00`)
    .lte('data_criacao', `${data_fim}T23:59:59`)

  if (status && status !== 'todos') {
    queryTransferencias = queryTransferencias.eq('status', status)
  }
  if (cd) {
    queryTransferencias = queryTransferencias.or(`cd_origem.eq.${cd},cd_destino.eq.${cd}`)
  }

  // Executar queries
  const [resultRemessas, resultRegressos, resultTransferencias] = await Promise.all([
    queryRemessas,
    queryRegressos,
    queryTransferencias
  ])

  // Contar por status
  const remessas = resultRemessas.data || []
  const regressos = resultRegressos.data || []
  const transferencias = resultTransferencias.data || []

  const todosMovimentos = [...remessas, ...regressos, ...transferencias]

  const movimentos_por_status = {
    em_transito: todosMovimentos.filter(m => m.status === 'em_transito').length,
    concluido: todosMovimentos.filter(m => m.status === 'concluido').length,
    cancelado: todosMovimentos.filter(m => m.status === 'cancelado').length
  }

  // Aplicar filtro de tipo se especificado
  let totalRemessas = resultRemessas.count || 0
  let totalRegressos = resultRegressos.count || 0
  let totalTransferencias = resultTransferencias.count || 0

  if (tipo && tipo !== 'todos') {
    if (tipo !== 'remessa') totalRemessas = 0
    if (tipo !== 'regresso') totalRegressos = 0
    if (tipo !== 'transferencia') totalTransferencias = 0
  }

  return {
    data: data_inicio,
    total_movimentos: totalRemessas + totalRegressos + totalTransferencias,
    remessas: totalRemessas,
    regressos: totalRegressos,
    transferencias: totalTransferencias,
    movimentos_por_status
  }
}

async function buscarMovimentosDetalhados(
  data_inicio: string, 
  data_fim: string, 
  filtros: { tipo?: string, status?: string, cd?: string, loja?: string }
): Promise<RelatorioMovimento[]> {
  const { tipo, status, cd, loja } = filtros
  const movimentos: RelatorioMovimento[] = []

  // Buscar remessas se não filtrado por tipo ou se tipo for remessa
  if (!tipo || tipo === 'todos' || tipo === 'remessa') {
    let queryRemessas = supabaseAdmin
      .from('cxativo_remessas')
      .select('*')
      .gte('data_criacao', `${data_inicio}T00:00:00`)
      .lte('data_criacao', `${data_fim}T23:59:59`)
      .order('data_criacao', { ascending: false })

    if (status && status !== 'todos') {
      queryRemessas = queryRemessas.eq('status', status)
    }
    if (cd) {
      queryRemessas = queryRemessas.eq('cd_origem', cd)
    }
    if (loja) {
      queryRemessas = queryRemessas.eq('loja_destino', loja)
    }

    const { data: remessas } = await queryRemessas

    if (remessas) {
      for (const remessa of remessas) {
        const movimento = await formatarMovimento(remessa, 'remessa')
        movimentos.push(movimento)
      }
    }
  }

  // Buscar regressos
  if (!tipo || tipo === 'todos' || tipo === 'regresso') {
    let queryRegressos = supabaseAdmin
      .from('cxativo_regressos')
      .select('*')
      .gte('data_criacao', `${data_inicio}T00:00:00`)
      .lte('data_criacao', `${data_fim}T23:59:59`)
      .order('data_criacao', { ascending: false })

    if (status && status !== 'todos') {
      queryRegressos = queryRegressos.eq('status', status)
    }
    if (cd) {
      queryRegressos = queryRegressos.eq('cd_destino', cd)
    }
    if (loja) {
      queryRegressos = queryRegressos.eq('loja_origem', loja)
    }

    const { data: regressos } = await queryRegressos

    if (regressos) {
      for (const regresso of regressos) {
        const movimento = await formatarMovimento(regresso, 'regresso')
        movimentos.push(movimento)
      }
    }
  }

  // Buscar transferências
  if (!tipo || tipo === 'todos' || tipo === 'transferencia') {
    let queryTransferencias = supabaseAdmin
      .from('cxativo_transferencias')
      .select('*')
      .gte('data_criacao', `${data_inicio}T00:00:00`)
      .lte('data_criacao', `${data_fim}T23:59:59`)
      .order('data_criacao', { ascending: false })

    if (status && status !== 'todos') {
      queryTransferencias = queryTransferencias.eq('status', status)
    }
    if (cd) {
      queryTransferencias = queryTransferencias.or(`cd_origem.eq.${cd},cd_destino.eq.${cd}`)
    }

    const { data: transferencias } = await queryTransferencias

    if (transferencias) {
      for (const transferencia of transferencias) {
        const movimento = await formatarMovimento(transferencia, 'transferencia')
        movimentos.push(movimento)
      }
    }
  }

  // Ordenar por data de criação (mais recentes primeiro)
  return movimentos.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
}

async function formatarMovimento(registro: any, tipo: 'remessa' | 'regresso' | 'transferencia'): Promise<RelatorioMovimento> {
  // Buscar usuário
  const { data: usuario } = await supabaseAdmin
    .from('cxativo_users')
    .select('nome, cd')
    .eq('id', registro.usuario_id)
    .single()

  // Buscar ativos
  const tabelaAtivos = tipo === 'remessa' ? 'cxativo_remessa_ativos' : 
                     tipo === 'regresso' ? 'cxativo_regresso_ativos' : 
                     'cxativo_transferencia_ativos'
  
  const chaveEstrangeira = tipo === 'remessa' ? 'remessa_id' : 
                          tipo === 'regresso' ? 'regresso_id' : 
                          'transferencia_id'

  const { data: ativos } = await supabaseAdmin
    .from(tabelaAtivos)
    .select('*')
    .eq(chaveEstrangeira, registro.id)

  // Buscar tipos de ativos
  const tipoAtivoIds = ativos?.map(a => a.tipo_ativo_id) || []
  const { data: tiposAtivos } = await supabaseAdmin
    .from('cxativo_tipos_ativos')
    .select('*')
    .in('id', tipoAtivoIds)

  const ativosFormatados = ativos?.map(ativo => {
    const tipoAtivo = tiposAtivos?.find(t => t.id === ativo.tipo_ativo_id)
    return {
      id: ativo.id,
      tipo_ativo_id: ativo.tipo_ativo_id,
      tipo_ativo_nome: tipoAtivo?.nome || 'Tipo não encontrado',
      tipo_ativo_codigo: tipoAtivo?.codigo || 'N/A',
      quantidade: ativo.quantidade
    }
  }) || []

  // Determinar origem e destino baseado no tipo
  let origem = ''
  let destino = ''
  
  if (tipo === 'remessa') {
    origem = registro.cd_origem
    destino = registro.loja_destino
  } else if (tipo === 'regresso') {
    origem = registro.loja_origem
    destino = registro.cd_destino
  } else if (tipo === 'transferencia') {
    origem = registro.cd_origem
    destino = registro.cd_destino
  }

    return {
    id: registro.id,
    codigo: registro.codigo,
    tipo,
    origem,
    destino,
    status: registro.status,
    data_criacao: registro.data_criacao,
    data_atualizacao: registro.data_atualizacao,
    usuario_nome: usuario?.nome || 'Usuário não encontrado',
    usuario_cd: usuario?.cd || 'CD não encontrado',
    ip_criacao: registro.ip_criacao || 'N/A',
    observacoes: registro.observacoes,
    ativos: ativosFormatados
  }
}