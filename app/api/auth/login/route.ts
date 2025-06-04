import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validations/auth'
import { AuthResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: validation.error.errors[0].message 
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Buscar usuário no banco
    const { data: user, error } = await supabaseAdmin
      .from('cxativo_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: 'Credenciais inválidas' 
        },
        { status: 401 }
      )
    }

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: 'Credenciais inválidas' 
        },
        { status: 401 }
      )
    }

    // Gerar token
    const token = generateToken(user)

    // Remover hash da senha da resposta
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json<AuthResponse>({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Login realizado com sucesso'
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json<AuthResponse>(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}