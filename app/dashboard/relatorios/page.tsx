"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { movimentos } from "@/lib/data"
import { Search, Filter } from "lucide-react"

export default function RelatoriosPage() {
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [busca, setBusca] = useState("")

  const movimentosFiltrados = movimentos.filter((movimento) => {
    const matchTipo = filtroTipo === "todos" || movimento.tipo === filtroTipo
    const matchStatus = filtroStatus === "todos" || movimento.status === filtroStatus
    const matchBusca =
      busca === "" ||
      movimento.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      movimento.origem.toLowerCase().includes(busca.toLowerCase()) ||
      movimento.destino.toLowerCase().includes(busca.toLowerCase())

    return matchTipo && matchStatus && matchBusca
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-500"
      case "em_transito":
        return "bg-yellow-500"
      case "pendente":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "concluido":
        return "Concluído"
      case "em_transito":
        return "Em Trânsito"
      case "pendente":
        return "Pendente"
      default:
        return status
    }
  }

  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case "remessa":
        return "Remessa"
      case "regresso":
        return "Regresso"
      case "transferencia":
        return "Transferência"
      default:
        return tipo
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "remessa":
        return "text-orange-600 bg-orange-100"
      case "regresso":
        return "text-green-600 bg-green-100"
      case "transferencia":
        return "text-purple-600 bg-purple-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const calcularEstatisticas = () => {
    const totalMovimentos = movimentos.length
    const remessas = movimentos.filter((m) => m.tipo === "remessa").length
    const regressos = movimentos.filter((m) => m.tipo === "regresso").length
    const transferencias = movimentos.filter((m) => m.tipo === "transferencia").length
    const concluidos = movimentos.filter((m) => m.status === "concluido").length

    return { totalMovimentos, remessas, regressos, transferencias, concluidos }
  }

  const stats = calcularEstatisticas()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Visualize todos os movimentos e estatísticas do sistema</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMovimentos}</div>
            <p className="text-xs text-muted-foreground">movimentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Remessas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.remessas}</div>
            <p className="text-xs text-muted-foreground">enviadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Regressos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regressos}</div>
            <p className="text-xs text-muted-foreground">recebidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Transferências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transferencias}</div>
            <p className="text-xs text-muted-foreground">realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidos}</div>
            <p className="text-xs text-muted-foreground">finalizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Código, origem ou destino..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
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
              <label className="text-sm font-medium">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Movimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentos ({movimentosFiltrados.length})</CardTitle>
          <CardDescription>Lista completa de todos os movimentos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {movimentosFiltrados.map((movimento) => (
              <div key={movimento.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{movimento.codigo}</span>
                    <Badge className={getTipoColor(movimento.tipo)}>{getTipoText(movimento.tipo)}</Badge>
                    <Badge className={getStatusColor(movimento.status)}>{getStatusText(movimento.status)}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(movimento.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Rota:</span> {movimento.origem} → {movimento.destino}
                  </div>
                  <div>
                    <span className="font-medium">Usuário:</span> {movimento.usuario}
                  </div>
                  <div>
                    <span className="font-medium">Itens:</span> {movimento.ativos.length} tipos de ativos
                  </div>
                </div>
              </div>
            ))}

            {movimentosFiltrados.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum movimento encontrado com os filtros aplicados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
