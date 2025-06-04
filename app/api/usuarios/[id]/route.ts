// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

const updateUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  cd: z.string().min(1, 'CD é obrigatório').optional(),
  role: z.enum(['admin', 'operador']).optional()
})

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

    // Verificar se o usuário é admin
    const { data: user } = await supabaseAdmin
      .from('cxativo_users')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem atualizar usuários.'
      }, { status: 403 })
    }

    const body = await request.json()
    const validation = updateUsuarioSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 })
    }

    const updateData = validation.data

    // Se está atualizando email, verificar se já existe
    if (updateData.email) {
      const { data: existingUser } = await supabaseAdmin
        .from('cxativo_users')
        .select('id')
        .eq('email', updateData.email.toLowerCase())
        .neq('id', params.id)
        .single()

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: 'Este email já está sendo usado por outro usuário'
        }, { status: 409 })
      }

      updateData.email = updateData.email.toLowerCase()
    }

    // Verificar se o usuário existe
    const { data: existingUser } = await supabaseAdmin
      .from('cxativo_users')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Atualizar usuário
    const { data: updatedUser, error } = await supabaseAdmin
      .from('cxativo_users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('id, nome, email, cd, role, created_at, updated_at')
      .single()

    if (error) {
      console.error('Erro ao atualizar usuário:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao atualizar usuário'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function DELETE(
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

    // Verificar se o usuário é admin
    const { data: user } = await supabaseAdmin
      .from('cxativo_users')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem excluir usuários.'
      }, { status: 403 })
    }

    // Verificar se não está tentando deletar a si mesmo
    if (decoded.userId === params.id) {
      return NextResponse.json({
        success: false,
        message: 'Você não pode excluir sua própria conta'
      }, { status: 400 })
    }

    // Verificar se o usuário existe
    const { data: existingUser } = await supabaseAdmin
      .from('cxativo_users')
      .select('id, nome')
      .eq('id', params.id)
      .single()

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 })
    }

    // Verificar se o usuário tem movimentos associados
    const checkTables = [
      'cxativo_remessas',
      'cxativo_regressos', 
      'cxativo_transferencias'
    ]

    for (const table of checkTables) {
      const { data: movements } = await supabaseAdmin
        .from(table)
        .select('id')
        .eq('usuario_id', params.id)
        .limit(1)

      if (movements && movements.length > 0) {
        return NextResponse.json({
          success: false,
          message: 'Não é possível excluir este usuário pois ele possui movimentos registrados no sistema'
        }, { status: 400 })
      }
    }

    // Excluir usuário
    const { error } = await supabaseAdmin
      .from('cxativo_users')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir usuário:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao excluir usuário'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}