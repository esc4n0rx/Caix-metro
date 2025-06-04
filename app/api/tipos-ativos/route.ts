import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

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

    const { data: tiposAtivos, error } = await supabaseAdmin
      .from('cxativo_tipos_ativos')
      .select('id, nome, codigo')
      .order('nome')

    if (error) {
      console.error('Erro ao buscar tipos de ativos:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar tipos de ativos'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: tiposAtivos || []
    })

  } catch (error) {
    console.error('Erro na API de tipos de ativos:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}