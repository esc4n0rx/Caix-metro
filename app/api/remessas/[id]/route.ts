import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { updateRemessaStatusSchema } from '@/lib/validations/remessa'

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

    // Buscar remessa
    const { data: remessa, error } = await supabaseAdmin
      .from('cxativo_remessas')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !remessa) {
      return NextResponse.json({
        success: false,
        message: 'Remessa não encontrada'
      }, { status: 404 })
    }

    // Buscar usuário
    const { data: usuario } = await supabaseAdmin
      .from('cxativo_users')
      .select('nome')
      .eq('id', remessa.usuario_id)
      .single()

    // Buscar ativos da remessa
    const { data: ativos } = await supabaseAdmin
      .from('cxativo_remessa_ativos')
      .select('*')
      .eq('remessa_id', remessa.id)

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

    const remessaFormatada = {
      ...remessa,
      usuario_nome: usuario?.nome || 'Usuário não encontrado',
      ativos: ativosFormatados
    }

    return NextResponse.json({
      success: true,
      data: remessaFormatada
    })

  } catch (error) {
    console.error('Erro ao buscar remessa:', error)
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
    const validation = updateRemessaStatusSchema.safeParse(body)
    
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
        message: 'Apenas administradores podem cancelar remessas'
      }, { status: 403 })
    }

    // Buscar remessa atual
    const { data: remessaAtual } = await supabaseAdmin
      .from('cxativo_remessas')
      .select('status')
      .eq('id', params.id)
      .single()

    if (!remessaAtual) {
      return NextResponse.json({
        success: false,
        message: 'Remessa não encontrada'
      }, { status: 404 })
    }

    // Verificar se status pode ser alterado
    if (remessaAtual.status === 'cancelado') {
      return NextResponse.json({
        success: false,
        message: 'Remessa cancelada não pode ter status alterado'
      }, { status: 400 })
    }

    if (remessaAtual.status === 'concluido' && status === 'concluido') {
      return NextResponse.json({
        success: false,
        message: 'Remessa já está concluída'
      }, { status: 400 })
    }

    // Atualizar remessa
    const { data: remessaAtualizada, error } = await supabaseAdmin
      .from('cxativo_remessas')
      .update({
        status,
        observacoes,
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar remessa:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao atualizar remessa'
      }, { status: 500 })
    }

    // Buscar dados relacionados
    const { data: usuario } = await supabaseAdmin
      .from('cxativo_users')
      .select('nome')
      .eq('id', remessaAtualizada.usuario_id)
      .single()

    const { data: ativos } = await supabaseAdmin
      .from('cxativo_remessa_ativos')
      .select('*')
      .eq('remessa_id', remessaAtualizada.id)

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

    const remessaFormatada = {
      ...remessaAtualizada,
      usuario_nome: usuario?.nome || 'Usuário não encontrado',
      ativos: ativosFormatados
    }

    return NextResponse.json({
      success: true,
      data: remessaFormatada,
      message: `Remessa ${status === 'concluido' ? 'concluída' : 'cancelada'} com sucesso`
    })

  } catch (error) {
    console.error('Erro ao atualizar remessa:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}