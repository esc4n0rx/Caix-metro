// app/api/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken, hashPassword } from '@/lib/auth'
import { z } from 'zod'

const createUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  cd: z.string().min(1, 'CD é obrigatório'),
  role: z.enum(['admin', 'operador'])
})

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

    // Verificar se o usuário é admin
    const { data: user } = await supabaseAdmin
      .from('cxativo_users')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem gerenciar usuários.'
      }, { status: 403 })
    }

    // Buscar todos os usuários
    const { data: usuarios, error } = await supabaseAdmin
      .from('cxativo_users')
      .select('id, nome, email, cd, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar usuários'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: usuarios || []
    })

  } catch (error) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

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

    // Verificar se o usuário é admin
    const { data: user } = await supabaseAdmin
      .from('cxativo_users')
      .select('role')
      .eq('id', decoded.userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem criar usuários.'
      }, { status: 403 })
    }

    const body = await request.json()
    const validation = createUsuarioSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 })
    }

    const { nome, email, password, cd, role } = validation.data

    // Verificar se email já existe
    const { data: existingUser } = await supabaseAdmin
      .from('cxativo_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Este email já está cadastrado'
      }, { status: 409 })
    }

    // Hash da senha
    const passwordHash = await hashPassword(password)

    // Criar usuário
    const { data: newUser, error } = await supabaseAdmin
      .from('cxativo_users')
      .insert({
        nome,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        cd,
        role
      })
      .select('id, nome, email, cd, role, created_at, updated_at')
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao criar usuário'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Usuário criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}