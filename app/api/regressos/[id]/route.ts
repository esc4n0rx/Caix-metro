import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { updateRegressoStatusSchema } from '@/lib/validations/regresso'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar regresso
    const { data: regresso, error } = await supabaseAdmin
      .from('cxativo_regressos')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !regresso) {
      return NextResponse.json({
        success: false,
        message: 'Regresso não encontrado'
      }, { status: 404 })
    }

    // Buscar usuário
    const { data: usuario } = await supabaseAdmin
      .from('cxativo_users')
      .select('nome')
      .eq('id', regresso.usuario_id)
      .single()

    // Buscar ativos do regresso
    const { data: ativos } = await supabaseAdmin
      .from('cxativo_regresso_ativos')
      .select('*')
      .eq('regresso_id', regresso.id)

    // Buscar tipos de ativos
    const tipoAtivoIds = ativos?.map(a => a.tipo_ativo_id) || []
    const { data: tiposAtivos } = await supabaseAdmin
      .from('cxativo_tipos_ativos')
      .select('*')
      .in('id', tipoAtivoIds)

    // Formatar dados
    const ativosFormatados = ativos?.map(ativo => {
      const tipoAtivo = tiposAtivos?.find(t => t.id === ativo.tipo_ativo_id)
      return {
        ...ativo,
        tipo_ativo_nome: tipoAtivo?.nome || 'Tipo não encontrado',
        tipo_ativo_codigo: tipoAtivo?.codigo || 'N/A'
      }
    }) || []

    const regressoFormatado = {
      ...regresso,
      usuario_nome: usuario?.nome || 'Usuário não encontrado',
      ativos: ativosFormatados
    }

    return NextResponse.json({
      success: true,
      data: regressoFormatado
    })

  } catch (error) {
    console.error('Erro ao buscar regresso:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const validation = updateRegressoStatusSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 })
    }

    const { status, observacoes } = validation.data

    // Buscar usuário para verificar permissões
    const { data: user } = await supabaseAdmin
      .from('cxativo_users')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Verificar se usuário pode cancelar (só admin pode cancelar)
    if (status === 'cancelado' && user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Apenas administradores podem cancelar regressos'
      }, { status: 403 })
    }

    // Buscar regresso atual
    const { data: regressoAtual } = await supabaseAdmin
      .from('cxativo_regressos')
      .select('status')
      .eq('id', params.id)
      .single()

    if (!regressoAtual) {
      return NextResponse.json({
        success: false,
        message: 'Regresso não encontrado'
      }, { status: 404 })
    }

    // Verificar se status pode ser alterado
    if (regressoAtual.status === 'cancelado') {
      return NextResponse.json({
        success: false,
        message: 'Regresso cancelado não pode ter status alterado'
      }, { status: 400 })
    }

    if (regressoAtual.status === 'concluido' && status === 'concluido') {
      return NextResponse.json({
        success: false,
        message: 'Regresso já está concluído'
      }, { status: 400 })
    }

    // Atualizar regresso
    const { data: regressoAtualizado, error } = await supabaseAdmin
      .from('cxativo_regressos')
      .update({
        status,
        observacoes,
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar regresso:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao atualizar regresso'
      }, { status: 500 })
    }

    // Buscar dados relacionados
    const { data: usuario } = await supabaseAdmin
      .from('cxativo_users')
      .select('nome')
      .eq('id', regressoAtualizado.usuario_id)
      .single()

    const { data: ativos } = await supabaseAdmin
      .from('cxativo_regresso_ativos')
      .select('*')
      .eq('regresso_id', regressoAtualizado.id)

    const tipoAtivoIds = ativos?.map(a => a.tipo_ativo_id) || []
    const { data: tiposAtivos } = await supabaseAdmin
      .from('cxativo_tipos_ativos')
      .select('*')
      .in('id', tipoAtivoIds)

    const ativosFormatados = ativos?.map(ativo => {
      const tipoAtivo = tiposAtivos?.find(t => t.id === ativo.tipo_ativo_id)
      return {
        ...ativo,
        tipo_ativo_nome: tipoAtivo?.nome || 'Tipo não encontrado',
        tipo_ativo_codigo: tipoAtivo?.codigo || 'N/A'
      }
    }) || []

    const regressoFormatado = {
      ...regressoAtualizado,
      usuario_nome: usuario?.nome || 'Usuário não encontrado',
      ativos: ativosFormatados
    }

    return NextResponse.json({
      success: true,
      data: regressoFormatado,
      message: `Regresso ${status === 'concluido' ? 'concluído' : 'cancelado'} com sucesso`
    })

  } catch (error) {
    console.error('Erro ao atualizar regresso:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}