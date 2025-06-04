import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { AuthResponse } from '@/types/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: 'Token não fornecido' 
        },
        { status: 401 }
      )
    }

    // Verificar token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: 'Token inválido' 
        },
        { status: 401 }
      )
    }

    // Buscar usuário atualizado
    const { data: user, error } = await supabaseAdmin
      .from('cxativo_users')
      .select('id, nome, email, cd, role, created_at, updated_at')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return NextResponse.json<AuthResponse>(
        { 
          success: false, 
          message: 'Usuário não encontrado' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      user,
      message: 'Token válido'
    })

  } catch (error) {
    console.error('Erro na verificação do token:', error)
    return NextResponse.json<AuthResponse>(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}