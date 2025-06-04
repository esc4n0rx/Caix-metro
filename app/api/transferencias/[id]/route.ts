// app/api/transferencias/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { updateTransferenciaStatusSchema } from '@/lib/validations/transferencia'

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

    // Buscar transferência
    const { data: transferencia, error } = await supabaseAdmin
      .from('cxativo_transferencias')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !transferencia) {
      return NextResponse.json({
        success: false,
        message: 'Transferência não encontrada'
      }, { status: 404 })
    }

    // Buscar usuário
    const { data: usuario } = await supabaseAdmin
      .from('cxativo_users')
      .select('nome')
      .eq('id', transferencia.usuario_id)
      .single()

    // Buscar ativos da transferência
    const { data: ativos } = await supabaseAdmin
      .from('cxativo_transferencia_ativos')
      .select('*')
      .eq('transferencia_id', transferencia.id)

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

    const transferenciaFormatada = {
      ...transferencia,
      usuario_nome: usuario?.nome || 'Usuário não encontrado',
      ativos: ativosFormatados
    }

    return NextResponse.json({
      success: true,
      data: transferenciaFormatada
    })

  } catch (error) {
    console.error('Erro ao buscar transferência:', error)
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
    const validation = updateTransferenciaStatusSchema.safeParse(body)
    
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
        message: 'Apenas administradores podem cancelar transferências'
      }, { status: 403 })
    }

    // Buscar transferência atual
    const { data: transferenciaAtual } = await supabaseAdmin
      .from('cxativo_transferencias')
      .select('status')
      .eq('id', params.id)
      .single()

    if (!transferenciaAtual) {
      return NextResponse.json({
        success: false,
        message: 'Transferência não encontrada'
      }, { status: 404 })
    }

    // Verificar se status pode ser alterado
    if (transferenciaAtual.status === 'cancelado') {
      return NextResponse.json({
        success: false,
        message: 'Transferência cancelada não pode ter status alterado'
      }, { status: 400 })
    }

    if (transferenciaAtual.status === 'concluido' && status === 'concluido') {
      return NextResponse.json({
        success: false,
        message: 'Transferência já está concluída'
      }, { status: 400 })
    }

    // Atualizar transferência
    const { data: transferenciaAtualizada, error } = await supabaseAdmin
      .from('cxativo_transferencias')
      .update({
        status,
        observacoes,
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar transferência:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao atualizar transferência'
      }, { status: 500 })
    }

    // Buscar dados relacionados
    const { data: usuario } = await supabaseAdmin
      .from('cxativo_users')
      .select('nome')
      .eq('id', transferenciaAtualizada.usuario_id)
      .single()

    const { data: ativos } = await supabaseAdmin
      .from('cxativo_transferencia_ativos')
      .select('*')
      .eq('transferencia_id', transferenciaAtualizada.id)

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

    const transferenciaFormatada = {
      ...transferenciaAtualizada,
      usuario_nome: usuario?.nome || 'Usuário não encontrado',
      ativos: ativosFormatados
    }

    return NextResponse.json({
      success: true,
      data: transferenciaFormatada,
      message: `Transferência ${status === 'concluido' ? 'concluída' : 'cancelada'} com sucesso`
    })

  } catch (error) {
    console.error('Erro ao atualizar transferência:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}