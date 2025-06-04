
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Package, 
  User, 
  MapPin, 
  Loader2,
  RefreshCw
} from "lucide-react"
import { useRelatorios } from "@/hooks/use-relatorios"
import { RelatorioCompleto } from "@/types/relatorio"
import { RelatorioFiltersData } from "@/lib/validations/relatorio"
import { lojas, centrosDistribuicao } from "@/lib/data"

export default function RelatoriosPage() {
  const [relatorio, setRelatorio] = useState<RelatorioCompleto | null>(null)
  const [filters, setFilters] = useState<Partial<RelatorioFiltersData>>({
    data_inicio: new Date().toISOString().split('T')[0], // Hoje
    data_fim: new Date().toISOString().split('T')[0], // Hoje
  })
  const [isExporting, setIsExporting] = useState(false)

  const { fetchRelatorio, exportarRelatorio, isLoading, error } = useRelatorios()

  useEffect(() => {
    loadRelatorio()
  }, [])

  const loadRelatorio = async () => {
    try {
      const data = await fetchRelatorio(filters)
      setRelatorio(data)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const handleFilterChange = (key: keyof RelatorioFiltersData, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'todos' ? undefined : value
    }))
  }

  const handleDateChange = (key: 'data_inicio' | 'data_fim', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleAplicarFiltros = () => {
    loadRelatorio()
  }

  const handleExport = async (formato: 'xlsx' | 'csv') => {
    setIsExporting(true)
    try {
      await exportarRelatorio(filters, formato)
    } catch (err) {

    } finally {
      setIsExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-500'
      case 'em_transito':
        return 'bg-yellow-500'
      case 'cancelado':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído'
      case 'em_transito':
        return 'Em Trânsito'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case 'remessa':
        return 'Remessa'
      case 'regresso':
        return 'Regresso'
      case 'transferencia':
        return 'Transferência'
      default:
        return tipo
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'remessa':
        return 'text-orange-600 bg-orange-100'
      case 'regresso':
        return 'text-green-600 bg-green-100'
      case 'transferencia':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
          <p className="text-muted-foreground">
            Análise detalhada de movimentos com exportação completa
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAplicarFiltros} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Atualizar
          </Button>
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
          <CardDescription>
            Configure os filtros para gerar relatórios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filters.data_inicio || ''}
                onChange={(e) => handleDateChange('data_inicio', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filters.data_fim || ''}
                onChange={(e) => handleDateChange('data_fim', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Movimento</Label>
              <Select
                value={filters.tipo || 'todos'}
                onValueChange={(value) => handleFilterChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="remessa">Remessa</SelectItem>
                  <SelectItem value="regresso">Regresso</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || 'todos'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Centro de Distribuição</Label>
              <Select
                value={filters.cd || 'todos'}
                onValueChange={(value) => handleFilterChange('cd', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os CDs</SelectItem>
                  {centrosDistribuicao.map((cd) => (
                    <SelectItem key={cd.id} value={cd.nome}>
                      {cd.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Loja</Label>
              <Select
                value={filters.loja || 'todos'}
                onValueChange={(value) => handleFilterChange('loja', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as lojas</SelectItem>
                  {lojas.map((loja) => (
                    <SelectItem key={loja.id} value={loja.nome}>
                      {loja.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAplicarFiltros} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {relatorio && (
        <>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas do Período
              </CardTitle>
              <CardDescription>
                {relatorio.periodo.data_inicio === relatorio.periodo.data_fim 
                  ? `Dados de ${new Date(relatorio.periodo.data_inicio).toLocaleDateString('pt-BR')}`
                  : `Período: ${new Date(relatorio.periodo.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(relatorio.periodo.data_fim).toLocaleDateString('pt-BR')}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {relatorio.estatisticas.total_movimentos}
                    </div>
                    <p className="text-sm text-muted-foreground">Total de Movimentos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {relatorio.estatisticas.remessas}
                    </div>
                    <p className="text-sm text-muted-foreground">Remessas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {relatorio.estatisticas.regressos}
                    </div>
                    <p className="text-sm text-muted-foreground">Regressos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {relatorio.estatisticas.transferencias}
                    </div>
                    <p className="text-sm text-muted-foreground">Transferências</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {relatorio.estatisticas.movimentos_por_status.concluido}
                    </div>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                  </CardContent>
                </Card>
              </div>


              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">
                    {relatorio.estatisticas.movimentos_por_status.em_transito}
                  </div>
                  <p className="text-sm text-muted-foreground">Em Trânsito</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {relatorio.estatisticas.movimentos_por_status.concluido}
                  </div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {relatorio.estatisticas.movimentos_por_status.cancelado}
                  </div>
                  <p className="text-sm text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Relatório
              </CardTitle>
              <CardDescription>
                Exporte os dados completos em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={() => handleExport('xlsx')} 
                  disabled={isExporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                  )}
                  Exportar Excel (XLSX)
                </Button>
                
                <Button 
                  onClick={() => handleExport('csv')} 
                  disabled={isExporting}
                  variant="outline"
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Exportar CSV
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                O arquivo Excel incluirá 3 abas: Estatísticas, Movimentos Detalhados e Ativos Detalhados
              </p>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Movimentos Detalhados ({relatorio.movimentos.length})
              </CardTitle>
              <CardDescription>
                Lista completa de todos os movimentos no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relatorio.movimentos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum movimento encontrado no período e filtros selecionados.
                </div>
              ) : (
                <div className="space-y-4">
                  {relatorio.movimentos.map((movimento) => (
                    <Card key={movimento.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg">{movimento.codigo}</span>
                            <Badge className={getTipoColor(movimento.tipo)}>
                              {getTipoText(movimento.tipo)}
                            </Badge>
                            <Badge className={getStatusColor(movimento.status)}>
                              {getStatusText(movimento.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(movimento.data_criacao)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Rota:</span>
                            <span>{movimento.origem} → {movimento.destino}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Usuário:</span>
                            <span>{movimento.usuario_nome}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Ativos:</span>
                            <span>{movimento.ativos.length} tipos</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-medium">CD:</span>
                            <span>{movimento.usuario_cd}</span>
                          </div>
                        </div>

                        {movimento.ativos.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm font-medium mb-2">Ativos Movimentados:</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {movimento.ativos.map((ativo) => (
                                <div key={ativo.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1">
                                  <span>
                                    {ativo.tipo_ativo_nome} ({ativo.tipo_ativo_codigo})
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {ativo.quantidade}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {movimento.observacoes && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm">
                              <span className="font-medium">Observações:</span>
                              <p className="text-muted-foreground mt-1">{movimento.observacoes}</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                          <span>IP: {movimento.ip_criacao}</span>
                          {movimento.data_atualizacao && movimento.data_atualizacao !== movimento.data_criacao && (
                            <span>Atualizado: {formatDate(movimento.data_atualizacao)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}