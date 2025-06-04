// app/api/transferencias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { createTransferenciaSchema, transferenciaFiltersSchema } from '@/lib/validations/transferencia'

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
      cd_destino: searchParams.get('cd_destino') || undefined,
      status: searchParams.get('status') || undefined,
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    const validation = transferenciaFiltersSchema.safeParse(filters)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 })
    }

    const { codigo, cd_destino, status, data_inicio, data_fim, page, limit } = validation.data

    // Buscar transferências
    let query = supabaseAdmin
      .from('cxativo_transferencias')
      .select('*', { count: 'exact' })

    if (codigo) {
      query = query.ilike('codigo', `%${codigo}%`)
    }

    if (cd_destino) {
      query = query.eq('cd_destino', cd_destino)
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

    const { data: transferencias, error, count } = await query

    if (error) {
      console.error('Erro ao buscar transferências:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar transferências'
      }, { status: 500 })
    }

    // Buscar dados dos usuários
    const usuarioIds = [...new Set(transferencias?.map(t => t.usuario_id) || [])]
    const { data: usuarios } = await supabaseAdmin
      .from('cxativo_users')
      .select('id, nome')
      .in('id', usuarioIds)

    // Buscar ativos das transferências
    const transferenciaIds = transferencias?.map(t => t.id) || []
    const { data: ativos } = await supabaseAdmin
      .from('cxativo_transferencia_ativos')
      .select(`
        id,
        transferencia_id,
        quantidade,
        tipo_ativo_id
      `)
      .in('transferencia_id', transferenciaIds)

    // Buscar tipos de ativos
    const tipoAtivoIds = [...new Set(ativos?.map(a => a.tipo_ativo_id) || [])]
    const { data: tiposAtivos } = await supabaseAdmin
      .from('cxativo_tipos_ativos')
      .select('id, nome, codigo')
      .in('id', tipoAtivoIds)

    // Montar resposta
    const transferenciasFormatadas = transferencias?.map(transferencia => {
      const usuario = usuarios?.find(u => u.id === transferencia.usuario_id)
      const ativosTransferencia = ativos?.filter(a => a.transferencia_id === transferencia.id) || []
      
      const ativosFormatados = ativosTransferencia.map(ativo => {
        const tipoAtivo = tiposAtivos?.find(t => t.id === ativo.tipo_ativo_id)
        return {
          ...ativo,
          tipo_ativo_nome: tipoAtivo?.nome || 'Tipo não encontrado',
          tipo_ativo_codigo: tipoAtivo?.codigo || 'N/A'
        }
      })

      return {
        ...transferencia,
        usuario_nome: usuario?.nome || 'Usuário não encontrado',
        ativos: ativosFormatados
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: transferenciasFormatadas,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de transferências:', error)
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
    const validation = createTransferenciaSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 })
    }

    const { cd_destino, ativos, observacoes } = validation.data

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

    // Verificar se não está tentando transferir para o mesmo CD
    if (user.cd === cd_destino) {
      return NextResponse.json({
        success: false,
        message: 'Não é possível transferir para o mesmo CD de origem'
      }, { status: 400 })
    }

    // Gerar código da transferência
    const now = new Date()
    const timestamp = now.getTime().toString().slice(-6)
    const codigo = `TRF-${timestamp}`

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

    // Criar transferência
    const { data: transferencia, error: transferenciaError } = await supabaseAdmin
      .from('cxativo_transferencias')
      .insert({
        codigo,
        cd_origem: user.cd,
        cd_destino,
        status: 'em_transito',
        usuario_id: user.id,
        ip_criacao: finalIp,
        observacoes
      })
      .select()
      .single()

    if (transferenciaError) {
      console.error('Erro ao criar transferência:', transferenciaError)
      return NextResponse.json({
        success: false,
        message: 'Erro ao criar transferência'
      }, { status: 500 })
    }

    // Inserir ativos da transferência
    const ativosData = ativos.map(ativo => ({
      transferencia_id: transferencia.id,
      tipo_ativo_id: ativo.tipo_ativo_id,
      quantidade: ativo.quantidade
    }))

    const { error: ativosError } = await supabaseAdmin
      .from('cxativo_transferencia_ativos')
      .insert(ativosData)

    if (ativosError) {
      console.error('Erro ao inserir ativos da transferência:', ativosError)
      // Rollback da criação da transferência se a inserção de ativos falhar
      await supabaseAdmin
        .from('cxativo_transferencias')
        .delete()
        .eq('id', transferencia.id)

      return NextResponse.json({
        success: false,
        message: 'Erro ao inserir ativos da transferência'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { ...transferencia, usuario_nome: user.nome, ativos: [] },
      message: 'Transferência criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar transferência:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}