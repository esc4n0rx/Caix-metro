import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword, generateToken } from '@/lib/auth'
import { registerSchema } from '@/lib/validations/auth'
import { AuthResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: validation.error.errors[0].message 
        },
        { status: 400 }
      )
    }

    const { nome, email, password, cd } = validation.data

    // Verificar se email já existe
    const { data: existingUser } = await supabaseAdmin
      .from('cxativo_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: 'Este email já está cadastrado' 
        },
        { status: 409 }
      )
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
        role: 'operador'
      })
      .select('id, nome, email, cd, role, created_at, updated_at')
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: 'Erro ao criar usuário' 
        },
        { status: 500 }
      )
    }

    // Gerar token
    const token = generateToken(newUser)

    return NextResponse.json<AuthResponse>({
      success: true,
      user: newUser,
      token,
      message: 'Usuário criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json<AuthResponse>(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}