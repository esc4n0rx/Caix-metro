
"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Filter, Calendar, Package, User, MapPin, Loader2, Eye } from "lucide-react"
import { CreateTransferenciaModal } from "@/components/create-transferencia-modal"
import { TransferenciaDetailsModal } from "@/components/transferencia-details-modal"
import { useTransferencias } from "@/hooks/use-transferencias"
import { Transferencia } from "@/types/transferencia"
import { TransferenciaFiltersData } from "@/lib/validations/transferencia"
import { centrosDistribuicao } from "@/lib/data"

export default function TransferenciaPage() {
  const [transferencias, setTransferencias] = useState<Transferencia[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<Partial<TransferenciaFiltersData>>({
    page: 1,
    limit: 20
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTransferenciaId, setSelectedTransferenciaId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  
  const { fetchTransferencias, isLoading, error } = useTransferencias()

  useEffect(() => {
    loadTransferencias()
  }, [filters])

  const loadTransferencias = async () => {
    try {
      const result = await fetchTransferencias(filters)
      setTransferencias(result.data)
      setPagination(result.pagination)
    } catch (err) {

    }
  }

  const handleFilterChange = (key: keyof TransferenciaFiltersData, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'todos' ? undefined : value,
      page: 1 
    }))
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      codigo: searchTerm || undefined,
      page: 1
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const handleCreateSuccess = () => {
    loadTransferencias()
  }

  const handleDetailsSuccess = () => {
    loadTransferencias()
  }

  const handleViewDetails = (transferenciaId: string) => {
    setSelectedTransferenciaId(transferenciaId)
    setIsDetailsModalOpen(true)
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
          <h1 className="text-3xl font-bold">Transferências</h1>
          <p className="text-muted-foreground">
            Gerencie transferências de ativos entre centros de distribuição
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Transferência
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar por código</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="TRF-001..."
                  value={filters.codigo || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>CD de destino</Label>
              <Select
                value={filters.cd_destino || 'todos'}
                onValueChange={(value) => handleFilterChange('cd_destino', value)}
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

            <div className="space-y-2">
              <Label>Data início</Label>
              <Input
                type="date"
                value={filters.data_inicio || ''}
                onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>


      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando transferências...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>

          <div className="space-y-4">
            {transferencias.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {Object.keys(filters).length > 2 
                      ? "Nenhuma transferência encontrada com os filtros aplicados."
                      : "Nenhuma transferência encontrada. Clique em 'Nova Transferência' para começar."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              transferencias.map((transferencia) => (
                <Card key={transferencia.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{transferencia.codigo}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {transferencia.cd_origem} → {transferencia.cd_destino}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(transferencia.status)}>
                          {getStatusText(transferencia.status)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(transferencia.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Criado em:</span>
                        <span>{formatDate(transferencia.data_criacao)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Por:</span>
                        <span>{transferencia.usuario_nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Itens:</span>
                        <span>{transferencia.ativos.length} tipos de ativos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                   {pagination.total} transferências
                 </div>
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     disabled={pagination.page <= 1}
                     onClick={() => handlePageChange(pagination.page - 1)}
                   >
                     Anterior
                   </Button>
                   <span className="text-sm">
                     Página {pagination.page} de {pagination.totalPages}
                   </span>
                   <Button
                     variant="outline"
                     size="sm"
                     disabled={pagination.page >= pagination.totalPages}
                     onClick={() => handlePageChange(pagination.page + 1)}
                   >
                     Próxima
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}
       </>
     )}

     <CreateTransferenciaModal
       isOpen={isCreateModalOpen}
       onClose={() => setIsCreateModalOpen(false)}
       onSuccess={handleCreateSuccess}
     />

     <TransferenciaDetailsModal
       transferenciaId={selectedTransferenciaId}
       isOpen={isDetailsModalOpen}
       onClose={() => {
         setIsDetailsModalOpen(false)
         setSelectedTransferenciaId(null)
       }}
       onSuccess={handleDetailsSuccess}
     />
   </div>
 )
}