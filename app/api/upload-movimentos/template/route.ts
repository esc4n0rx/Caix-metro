// app/api/upload-movimentos/template/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'
import { lojas, centrosDistribuicao, tiposAtivos } from '@/lib/data'

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
    const tipo = searchParams.get('tipo') as 'remessa' | 'regresso' | 'transferencia'

    if (!tipo || !['remessa', 'regresso', 'transferencia'].includes(tipo)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tipo inválido. Use: remessa, regresso ou transferencia' 
      }, { status: 400 })
    }

    const workbook = XLSX.utils.book_new()

    // Aba 1: Template principal
    const templateHeaders = getTemplateHeaders(tipo)
    const exampleData = getExampleData(tipo)
    
    const templateData = [
      templateHeaders,
      ...exampleData
    ]

    const wsTemplate = XLSX.utils.aoa_to_sheet(templateData)
    
    // Define largura das colunas
    const colWidths = [
      { wch: 20 }, // origem/destino
      { wch: 20 }, // destino/origem  
      { wch: 25 }, // observacoes
      { wch: 20 }, // tipo_ativo_1
      { wch: 12 }, // quantidade_1
      { wch: 20 }, // tipo_ativo_2
      { wch: 12 }, // quantidade_2
      { wch: 20 }, // tipo_ativo_3
      { wch: 12 }, // quantidade_3
    ]
    wsTemplate['!cols'] = colWidths

    XLSX.utils.book_append_sheet(workbook, wsTemplate, 'Template')

    // Aba 2: Lista de Lojas
    const lojasHeaders = ['Nome da Loja', 'Variações Aceitas']
    const lojasData = lojas.map(loja => [
      loja.nome,
      `${loja.nome.toLowerCase()}, ${loja.nome.replace(/\s+/g, '').toLowerCase()}, ${loja.nome.substring(0, 4).toLowerCase()}`
    ])

    const lojasSheetData = [lojasHeaders, ...lojasData]
    const wsLojas = XLSX.utils.aoa_to_sheet(lojasSheetData)
    wsLojas['!cols'] = [{ wch: 25 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(workbook, wsLojas, 'Lojas')

    // Aba 3: Lista de CDs (para transferências)
    if (tipo === 'transferencia') {
      const cdsHeaders = ['Nome do CD']
      const cdsData = centrosDistribuicao.map(cd => [cd.nome])
      
      const cdsSheetData = [cdsHeaders, ...cdsData]
      const wsCDs = XLSX.utils.aoa_to_sheet(cdsSheetData)
      wsCDs['!cols'] = [{ wch: 25 }]
      XLSX.utils.book_append_sheet(workbook, wsCDs, 'Centros_Distribuicao')
    }

    // Aba 4: Tipos de Ativos
    const ativosHeaders = ['Nome do Ativo', 'Código', 'Exemplo de Uso']
    const ativosData = tiposAtivos.map(ativo => [
      ativo.nome,
      ativo.codigo,
      `Use "${ativo.nome}" ou "${ativo.codigo}" na planilha`
    ])

    const ativosSheetData = [ativosHeaders, ...ativosData]
    const wsAtivos = XLSX.utils.aoa_to_sheet(ativosSheetData)
    wsAtivos['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 35 }]
    XLSX.utils.book_append_sheet(workbook, wsAtivos, 'Tipos_Ativos')

    // Aba 5: Instruções
    const instrucoesData = getInstrucoesData(tipo)
    const wsInstrucoes = XLSX.utils.aoa_to_sheet(instrucoesData)
    wsInstrucoes['!cols'] = [{ wch: 80 }]
    XLSX.utils.book_append_sheet(workbook, wsInstrucoes, 'Instrucoes')

    // Gerar arquivo
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const filename = `template_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Erro ao gerar template:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

function getTemplateHeaders(tipo: 'remessa' | 'regresso' | 'transferencia'): string[] {
  const baseHeaders = []
  
  if (tipo === 'remessa') {
    baseHeaders.push('loja_destino', 'observacoes')
  } else if (tipo === 'regresso') {
    baseHeaders.push('loja_origem', 'observacoes')
  } else if (tipo === 'transferencia') {
    baseHeaders.push('cd_destino', 'observacoes')
  }

  // Adiciona colunas para até 3 tipos de ativos
  for (let i = 1; i <= 3; i++) {
    baseHeaders.push(`tipo_ativo_${i}`, `quantidade_${i}`)
  }

  return baseHeaders
}

function getExampleData(tipo: 'remessa' | 'regresso' | 'transferencia'): string[][] {
  if (tipo === 'remessa') {
    return [
      ['BOTAFOGO', 'Remessa semanal', 'CAIXA HNT G', '50', 'SACO BAG', '100', '', ''],
      ['macae', 'Urgente', 'CAIXA HNT P', '30', '', '', '', ''],
      ['CABO FRIO', '', 'PALLET PBR', '15', 'CAIXA BASCULHANTE', '25', '', '']
    ]
  } else if (tipo === 'regresso') {
    return [
      ['TIJUCA', 'Retorno mensal', 'CAIXA HNT G', '20', 'SACO BAG', '40', '', ''],
      ['grajau', '', 'CAIXA HNT P', '15', '', '', '', ''],
      ['FLAMENGO', 'Verificar qualidade', 'PALLET PBR', '10', '', '', '', '']
    ]
  } else {
    return [
      ['CD SÃO PAULO', 'Transferência programada', 'CAIXA HNT G', '100', 'SACO BAG', '200', '', ''],
      ['CD ESPIRITO SANTO', '', 'CAIXA HNT P', '50', 'PALLET PBR', '25', '', '']
    ]
  }
}

function getInstrucoesData(tipo: 'remessa' | 'regresso' | 'transferencia'): string[][] {
  const tipoText = tipo === 'remessa' ? 'Remessa' : tipo === 'regresso' ? 'Regresso' : 'Transferência'
  
  return [
    [`INSTRUÇÕES PARA UPLOAD DE ${tipoText.toUpperCase()}`],
    [''],
    ['1. PREENCHIMENTO OBRIGATÓRIO:'],
    [tipo === 'remessa' ? '   - loja_destino: Nome da loja (pode usar variações)' : 
     tipo === 'regresso' ? '   - loja_origem: Nome da loja (pode usar variações)' :
     '   - cd_destino: Nome do CD de destino'],
    ['   - tipo_ativo_1: Nome ou código do primeiro tipo de ativo'],
    ['   - quantidade_1: Quantidade do primeiro ativo (número inteiro)'],
    [''],
    ['2. PREENCHIMENTO OPCIONAL:'],
    ['   - observacoes: Comentários sobre o movimento'],
    ['   - tipo_ativo_2, quantidade_2: Segundo tipo de ativo'],
    ['   - tipo_ativo_3, quantidade_3: Terceiro tipo de ativo'],
    [''],
    ['3. REGRAS IMPORTANTES:'],
    ['   - Não altere os nomes das colunas'],
    ['   - Use apenas a aba "Template" para seus dados'],
    ['   - As quantidades devem ser números inteiros maiores que zero'],
    ['   - Para lojas, consulte a aba "Lojas" para ver nomes aceitos'],
    ['   - Para ativos, consulte a aba "Tipos_Ativos"'],
    [''],
    ['4. ALGORITMO DE LOJAS:'],
    ['   - O sistema reconhece variações nos nomes'],
    ['   - Exemplos aceitos: "MACAE", "macaé", "maca" → MACAE'],
    ['   - Confiança mínima: 70%'],
    [''],
    ['5. EXEMPLO DE USO:'],
    ['   - Veja as primeiras linhas do template como exemplo'],
    ['   - Apague os exemplos antes de fazer o upload'],
    [''],
    ['6. SUPORTE:'],
    ['   - Em caso de erro, verifique se seguiu todas as regras'],
    ['   - O sistema mostrará erros específicos por linha'],
    ['   - Corrija os erros e faça upload novamente']
  ]
}