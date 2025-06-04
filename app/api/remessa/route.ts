import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { createRemessaSchema, remessaFiltersSchema } from '@/lib/validations/remessa'

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
      loja_destino: searchParams.get('loja_destino') || undefined,
      status: searchParams.get('status') || undefined,
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    const validation = remessaFiltersSchema.safeParse(filters)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 })
    }

    const { codigo, loja_destino, status, data_inicio, data_fim, page, limit } = validation.data

    let query = supabaseAdmin
      .from('cxativo_remessas')
      .select(`
        *,
        usuario:cxativo_users(nome),
        ativos:cxativo_remessa_ativos(
          id,
          quantidade,
          tipo_ativo:cxativo_tipos_ativos(id, nome, codigo)
        )
      `)

    if (codigo) {
      query = query.ilike('codigo', `%${codigo}%`)
    }

    if (loja_destino) {
      query = query.eq('loja_destino', loja_destino)
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

    const { data: remessas, error, count } = await query

    if (error) {
      console.error('Erro ao buscar remessas:', error)
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar remessas'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: remessas,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de remessas:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createRemessaSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message
      }, { status: 400 });
    }

    const { loja_destino, ativos, observacoes } = validation.data;

    // Buscar dados do usuário
    const { data: user } = await supabaseAdmin
      .from('cxativo_users')
      .select('id, nome, cd')
      .eq('id', decoded.userId)
      .single();

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não encontrado'
      }, { status: 404 });
    }

    // Gerar código da remessa
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    const codigo = `REM-${timestamp}`;

    // --- AJUSTE NA CAPTURA DE IP ---
    let ipAddress: string | undefined;

    // 1. Tente o header 'x-forwarded-for' (comum para proxies)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      // Este header pode ser uma lista de IPs separados por vírgula (ex: "client, proxy1, proxy2")
      // O IP do cliente é geralmente o primeiro.
      ipAddress = forwardedFor.split(',')[0].trim();
    }

    // 2. Se não encontrado, tente o header 'x-real-ip'
    if (!ipAddress) {
      const realIp = request.headers.get('x-real-ip');
      if (realIp) {
        ipAddress = realIp.trim();
      }
    }

    if (!ipAddress) {
      const connection = request.headers.get('connection');
      if (connection) {
        ipAddress = connection;
      }
    }

    const finalIp = ipAddress || 'unknown';
    // --- FIM DO AJUSTE ---

    // Criar remessa
    const { data: remessa, error: remessaError } = await supabaseAdmin
      .from('cxativo_remessas')
      .insert({
        codigo,
        cd_origem: user.cd,
        loja_destino,
        status: 'em_transito',
        usuario_id: user.id,
        ip_criacao: finalIp, // Use o IP capturado aqui
        observacoes
      })
      .select()
      .single();

    if (remessaError) {
      console.error('Erro ao criar remessa:', remessaError);
      return NextResponse.json({
        success: false,
        message: 'Erro ao criar remessa'
      }, { status: 500 });
    }

    // Inserir ativos da remessa
    const ativosData = ativos.map(ativo => ({
      remessa_id: remessa.id,
      tipo_ativo_id: ativo.tipo_ativo_id,
      quantidade: ativo.quantidade
    }));

    const { error: ativosError } = await supabaseAdmin
      .from('cxativo_remessa_ativos')
      .insert(ativosData);

    if (ativosError) {
      console.error('Erro ao inserir ativos da remessa:', ativosError);
      // Rollback da criação da remessa se a inserção de ativos falhar
      await supabaseAdmin
        .from('cxativo_remessas')
        .delete()
        .eq('id', remessa.id);

      return NextResponse.json({
        success: false,
        message: 'Erro ao inserir ativos da remessa'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { ...remessa, usuario_nome: user.nome },
      message: 'Remessa criada com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar remessa:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}