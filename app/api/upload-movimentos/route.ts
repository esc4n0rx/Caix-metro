// app/api/upload-movimentos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'
import { findBestLojaMatch } from '@/lib/loja-matcher'
import { centrosDistribuicao, tiposAtivos } from '@/lib/data'
import { ProcessedMovimento, UploadResult } from '@/types/upload'

export async function POST(request: NextRequest) {
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

    // Buscar dados do usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from('cxativo_users')
      .select('id, nome, cd')
      .eq('id', decoded.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tipo = formData.get('tipo') as 'remessa' | 'regresso' | 'transferencia'

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      }, { status: 400 })
    }

    if (!tipo || !['remessa', 'regresso', 'transferencia'].includes(tipo)) {
      return NextResponse.json({
        success: false,
        message: 'Tipo inválido'
      }, { status: 400 })
    }

    // Ler arquivo Excel
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({
        success: false,
        message: 'Planilha não encontrada'
      }, { status: 400 })
    }

    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

    if (jsonData.length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Planilha deve ter pelo menos 2 linhas (cabeçalho + dados)'
      }, { status: 400 })
    }

    // Processar dados
    const headers = jsonData[0].map(h => String(h).toLowerCase().trim())
    const dataRows = jsonData.slice(1)

    const processedMovimentos: ProcessedMovimento[] = []
    const erros: { linha: number; erros: string[] }[] = []

    for (let i = 0; i < dataRows.length; i++) {
      const linha = i + 2 // +2 porque linha 1 é cabeçalho e arrays começam em 0
      const row = dataRows[i]
      
      // Pular linhas vazias
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        continue
      }

      const movimento = processRow(row, headers, tipo, user.cd, linha)
      
      if (movimento.erros.length > 0) {
        erros.push({
          linha: linha,
          erros: movimento.erros
        })
      } else {
        processedMovimentos.push(movimento)
      }
    }

    // Criar movimentos no banco
    let movimentosCriados = 0
    
    for (const movimento of processedMovimentos) {
      try {
        await createMovimento(movimento, user.id)
        movimentosCriados++
      } catch (error) {
        console.error('Erro ao criar movimento:', error)
        erros.push({
          linha: movimento.linha,
          erros: ['Erro ao salvar no banco de dados']
        })
      }
    }

    const result: UploadResult = {
      success: true,
      total_linhas: dataRows.length,
      movimentos_processados: processedMovimentos.length,
      movimentos_criados: movimentosCriados,
      erros
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

function processRow(
  row: any[], 
  headers: string[], 
  tipo: 'remessa' | 'regresso' | 'transferencia',
  userCd: string,
  linha: number
): ProcessedMovimento {
  const movimento: ProcessedMovimento = {
    tipo,
    origem: '',
    destino: '',
    observacoes: '',
    ativos: [],
    linha,
    erros: []
  }

  // Mapear colunas
  const data: { [key: string]: any } = {}
  headers.forEach((header, index) => {
    data[header] = row[index] ? String(row[index]).trim() : ''
  })

  // Validar e processar origem/destino
  if (tipo === 'remessa') {
    movimento.origem = userCd
    const lojaDestino = data['loja_destino'] || ''
    
    if (!lojaDestino) {
      movimento.erros.push('loja_destino é obrigatória')
    } else {
      const match = findBestLojaMatch(lojaDestino)
      if (match.match) {
        movimento.destino = match.match
        movimento.destino_matched = match.match
      } else {
        movimento.erros.push(`Loja não encontrada: "${lojaDestino}"`)
      }
    }
  } else if (tipo === 'regresso') {
    movimento.destino = userCd
    const lojaOrigem = data['loja_origem'] || ''
    
    if (!lojaOrigem) {
      movimento.erros.push('loja_origem é obrigatória')
    } else {
      const match = findBestLojaMatch(lojaOrigem)
      if (match.match) {
        movimento.origem = match.match
        movimento.origem_matched = match.match
      } else {
        movimento.erros.push(`Loja não encontrada: "${lojaOrigem}"`)
      }
    }
  } else if (tipo === 'transferencia') {
    movimento.origem = userCd
    const cdDestino = data['cd_destino'] || ''
    
    if (!cdDestino) {
      movimento.erros.push('cd_destino é obrigatório')
    } else {
      const cdEncontrado = centrosDistribuicao.find(cd => 
        cd.nome.toLowerCase() === cdDestino.toLowerCase()
      )
      
      if (cdEncontrado) {
        movimento.destino = cdEncontrado.nome
      } else {
        movimento.erros.push(`CD não encontrado: "${cdDestino}"`)
      }
    }
  }

  // Processar observações
  movimento.observacoes = data['observacoes'] || ''

  // Processar ativos (até 3)
  for (let i = 1; i <= 3; i++) {
    const tipoAtivo = data[`tipo_ativo_${i}`] || ''
    const quantidade = data[`quantidade_${i}`] || ''

    if (tipoAtivo && quantidade) {
      // Encontrar tipo de ativo
      const ativoEncontrado = tiposAtivos.find(ativo => 
        ativo.nome.toLowerCase() === tipoAtivo.toLowerCase() ||
        ativo.codigo.toLowerCase() === tipoAtivo.toLowerCase()
      )

      if (!ativoEncontrado) {
        movimento.erros.push(`Tipo de ativo não encontrado: "${tipoAtivo}"`)
        continue
      }

      // Validar quantidade
      const qty = parseInt(quantidade)
      if (isNaN(qty) || qty <= 0) {
        movimento.erros.push(`Quantidade inválida para ${tipoAtivo}: "${quantidade}"`)
        continue
      }

      // Verificar duplicata
      if (movimento.ativos.some(a => a.tipo_ativo === ativoEncontrado.nome)) {
        movimento.erros.push(`Tipo de ativo duplicado: "${tipoAtivo}"`)
        continue
      }

      movimento.ativos.push({
        tipo_ativo: ativoEncontrado.nome,
        quantidade: qty
      })
    }
  }

  // Validar se tem pelo menos um ativo
  if (movimento.ativos.length === 0) {
    movimento.erros.push('Pelo menos um ativo deve ser especificado')
  }

  return movimento
}

async function createMovimento(movimento: ProcessedMovimento, userId: string) {
  const now = new Date()
  const timestamp = now.getTime().toString().slice(-6)
  const prefixo = movimento.tipo === 'remessa' ? 'REM' : 
                  movimento.tipo === 'regresso' ? 'REG' : 'TRF'
  const codigo = `${prefixo}-${timestamp}`

  // Buscar IDs dos tipos de ativos
  const tipoAtivoNomes = movimento.ativos.map(a => a.tipo_ativo)
  const { data: tiposAtivosDb } = await supabaseAdmin
    .from('cxativo_tipos_ativos')
    .select('id, nome')
    .in('nome', tipoAtivoNomes)

  const ativosData = movimento.ativos.map(ativo => {
    const tipoAtivoDb = tiposAtivosDb?.find(t => t.nome === ativo.tipo_ativo)
    if (!tipoAtivoDb) {
      throw new Error(`Tipo de ativo não encontrado no banco: ${ativo.tipo_ativo}`)
    }
    return {
      tipo_ativo_id: tipoAtivoDb.id,
      quantidade: ativo.quantidade
    }
  })

  if (movimento.tipo === 'remessa') {
    // Criar remessa
    const { data: remessa, error: remessaError } = await supabaseAdmin
      .from('cxativo_remessas')
      .insert({
        codigo,
        cd_origem: movimento.origem,
        loja_destino: movimento.destino,
        status: 'em_transito',
        usuario_id: userId,
        ip_criacao: 'upload',
        observacoes: movimento.observacoes || null
      })
      .select()
      .single()

    if (remessaError) throw remessaError

    // Inserir ativos
    const ativosRemessa = ativosData.map(ativo => ({
      remessa_id: remessa.id,
      ...ativo
    }))

    const { error: ativosError } = await supabaseAdmin
      .from('cxativo_remessa_ativos')
      .insert(ativosRemessa)

    if (ativosError) throw ativosError

  } else if (movimento.tipo === 'regresso') {
    // Criar regresso
    const { data: regresso, error: regressoError } = await supabaseAdmin
      .from('cxativo_regressos')
      .insert({
        codigo,
        loja_origem: movimento.origem,
        cd_destino: movimento.destino,
        status: 'em_transito',
        usuario_id: userId,
        ip_criacao: 'upload',
        observacoes: movimento.observacoes || null
      })
      .select()
      .single()

    if (regressoError) throw regressoError

    // Inserir ativos
    const ativosRegresso = ativosData.map(ativo => ({
      regresso_id: regresso.id,
      ...ativo
    }))

    const { error: ativosError } = await supabaseAdmin
      .from('cxativo_regresso_ativos')
      .insert(ativosRegresso)

    if (ativosError) throw ativosError

  } else if (movimento.tipo === 'transferencia') {
    // Criar transferência
    const { data: transferencia, error: transferenciaError } = await supabaseAdmin
      .from('cxativo_transferencias')
      .insert({
        codigo,
        cd_origem: movimento.origem,
        cd_destino: movimento.destino,
        status: 'em_transito',
        usuario_id: userId,
        ip_criacao: 'upload',
        observacoes: movimento.observacoes || null
      })
      .select()
      .single()

    if (transferenciaError) throw transferenciaError

    // Inserir ativos
    const ativosTransferencia = ativosData.map(ativo => ({
      transferencia_id: transferencia.id,
      ...ativo
    }))

    const { error: ativosError } = await supabaseAdmin
      .from('cxativo_transferencia_ativos')
      .insert(ativosTransferencia)

    if (ativosError) throw ativosError
  }
}