// app/api/regressos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { createRegressoSchema, regressoFiltersSchema } from '@/lib/validations/regresso'

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

    const { searchParams } = new URL(request.url)
    const filters = {
      codigo: searchParams.get('codigo') || undefined,
      loja_origem: searchParams.get('loja_origem') || undefined,
      status: searchParams.get('status') || undefined,
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    const validation = regressoFiltersSchema.safeParse(filters)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 })
    }

    const { codigo, loja_origem, status, data_inicio, data_fim, page, limit } = validation.data

    // Buscar regressos
    let query = supabaseAdmin
      .from('cxativo_regressos')
      .select('*', { count: 'exact' })

    if (codigo) {
      query = query.ilike('codigo', `%${codigo}%`)
    }

    if (loja_origem) {
      query = query.eq('loja_origem', loja_origem)
    }

    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    if (data_inicio) {
      query = query.gte('data_criacao', data_inicio)
    }

    if (data_fim) {
      query = query.lte('data_criacao', data_fim)
    }

    const offset = (page - 1) * limit
    query = query
      .order('data_criacao', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: regressos, error, count } = await query

    if (error) {
      console.error('Erro ao buscar regressos:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar regressos'
      }, { status: 500 })
    }

    // Buscar dados dos usuários
    const usuarioIds = [...new Set(regressos?.map(r => r.usuario_id) || [])]
    const { data: usuarios } = await supabaseAdmin
      .from('cxativo_users')
      .select('id, nome')
      .in('id', usuarioIds)

    // Buscar ativos dos regressos
    const regressoIds = regressos?.map(r => r.id) || []
    const { data: ativos } = await supabaseAdmin
      .from('cxativo_regresso_ativos')
      .select(`
        id,
        regresso_id,
        quantidade,
        tipo_ativo_id
      `)
      .in('regresso_id', regressoIds)

    // Buscar tipos de ativos
    const tipoAtivoIds = [...new Set(ativos?.map(a => a.tipo_ativo_id) || [])]
    const { data: tiposAtivos } = await supabaseAdmin
      .from('cxativo_tipos_ativos')
      .select('id, nome, codigo')
      .in('id', tipoAtivoIds)

    // Montar resposta
    const regressosFormatados = regressos?.map(regresso => {
      const usuario = usuarios?.find(u => u.id === regresso.usuario_id)
      const ativosRegresso = ativos?.filter(a => a.regresso_id === regresso.id) || []
      
      const ativosFormatados = ativosRegresso.map(ativo => {
        const tipoAtivo = tiposAtivos?.find(t => t.id === ativo.tipo_ativo_id)
        return {
          ...ativo,
          tipo_ativo_nome: tipoAtivo?.nome || 'Tipo não encontrado',
          tipo_ativo_codigo: tipoAtivo?.codigo || 'N/A'
        }
      })

      return {
        ...regresso,
        usuario_nome: usuario?.nome || 'Usuário não encontrado',
        ativos: ativosFormatados
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: regressosFormatados,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de regressos:', error)
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

    const body = await request.json()
    const validation = createRegressoSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 })
    }

    const { loja_origem, ativos, observacoes } = validation.data

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

    // Gerar código do regresso
    const now = new Date()
    const timestamp = now.getTime().toString().slice(-6)
    const codigo = `REG-${timestamp}`

    // Capturar IP do usuário
    let ipAddress: string | undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
      ipAddress = forwardedFor.split(',')[0].trim()
    }
    if (!ipAddress) {
      const realIp = request.headers.get('x-real-ip')
      if (realIp) {
        ipAddress = realIp.trim()
      }
    }
    const finalIp = ipAddress || 'unknown'

    // Criar regresso
    const { data: regresso, error: regressoError } = await supabaseAdmin
      .from('cxativo_regressos')
      .insert({
        codigo,
        loja_origem,
        cd_destino: user.cd,
        status: 'em_transito',
        usuario_id: user.id,
        ip_criacao: finalIp,
        observacoes
      })
      .select()
      .single()

    if (regressoError) {
      console.error('Erro ao criar regresso:', regressoError)
      return NextResponse.json({
        success: false,
        message: 'Erro ao criar regresso'
      }, { status: 500 })
    }

    // Inserir ativos do regresso
    const ativosData = ativos.map(ativo => ({
      regresso_id: regresso.id,
      tipo_ativo_id: ativo.tipo_ativo_id,
      quantidade: ativo.quantidade
    }))

    const { error: ativosError } = await supabaseAdmin
      .from('cxativo_regresso_ativos')
      .insert(ativosData)

    if (ativosError) {
      console.error('Erro ao inserir ativos do regresso:', ativosError)
      // Rollback da criação do regresso se a inserção de ativos falhar
      await supabaseAdmin
        .from('cxativo_regressos')
        .delete()
        .eq('id', regresso.id)

      return NextResponse.json({
        success: false,
        message: 'Erro ao inserir ativos do regresso'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { ...regresso, usuario_nome: user.nome, ativos: [] },
      message: 'Regresso criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar regresso:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}