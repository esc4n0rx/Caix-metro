"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Package, User, Calendar, MapPin, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRemessas } from "@/hooks/use-remessas"
import { Remessa } from "@/types/remessa"
import { updateRemessaStatusSchema, UpdateRemessaStatusFormData } from "@/lib/validations/remessa"

interface RemessaDetailsModalProps {
  remessaId: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RemessaDetailsModal({ remessaId, isOpen, onClose, onSuccess }: RemessaDetailsModalProps) {
  const [remessa, setRemessa] = useState<Remessa | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { user } = useAuth()
  const { fetchRemessa, updateRemessaStatus, isLoading, error } = useRemessas()

  const form = useForm<UpdateRemessaStatusFormData>({
    resolver: zodResolver(updateRemessaStatusSchema),
    defaultValues: {
      status: 'concluido',
      observacoes: ""
    }
  })

  useEffect(() => {
    if (isOpen && remessaId) {
      loadRemessa()
    }
  }, [isOpen, remessaId])

  const loadRemessa = async () => {
    if (!remessaId) return

    try {
      const data = await fetchRemessa(remessaId)
      setRemessa(data)
    } catch (err) {

    }
  }

  const handleUpdateStatus = async (data: UpdateRemessaStatusFormData) => {
    if (!remessaId) return

    setIsUpdating(true)
    try {
      const updatedRemessa = await updateRemessaStatus(remessaId, data)
      setRemessa(updatedRemessa)
      onSuccess()
      form.reset()
    } catch (err) {

    } finally {
      setIsUpdating(false)
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

  const canUpdateStatus = remessa && remessa.status !== 'cancelado' && remessa.status !== 'concluido'
  const canCancel = user?.role === 'admin' && remessa?.status === 'em_transito'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Remessa</DialogTitle>
          <DialogDescription>
            Visualize e altere o status da remessa
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && !remessa ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : remessa ? (
          <div className="space-y-6">

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{remessa.codigo}</CardTitle>
                  <Badge className={getStatusColor(remessa.status)}>
                    {getStatusText(remessa.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Rota:</span> {remessa.cd_origem} → {remessa.loja_destino}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Criado por:</span> {remessa.usuario_nome}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Data de criação:</span>{" "}
                      {new Date(remessa.data_criacao).toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo'
                      })}
                    </span>
                  </div>

                  {remessa.data_atualizacao && remessa.data_atualizacao !== remessa.data_criacao && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Última atualização:</span>{" "}
                        {new Date(remessa.data_atualizacao).toLocaleString('pt-BR', {
                          timeZone: 'America/Sao_Paulo'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {remessa.observacoes && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Observações:</span>
                        <p className="text-sm text-muted-foreground">{remessa.observacoes}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Ativos ({remessa.ativos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {remessa.ativos.map((ativo) => (
                    <div key={ativo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{ativo.tipo_ativo_nome}</span>
                        <span className="text-sm text-muted-foreground ml-2">({ativo.tipo_ativo_codigo})</span>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {ativo.quantidade} unidades
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {canUpdateStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(handleUpdateStatus)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Novo Status</Label>
                      <Select
                        value={form.watch('status')}
                        onValueChange={(value: 'concluido' | 'cancelado') => form.setValue('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          {canCancel && (
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.status && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.status.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações (opcional)</Label>
                      <Textarea
                        id="observacoes"
                        placeholder="Observações sobre a alteração de status..."
                        {...form.register("observacoes")}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Fechar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className={
                          form.watch('status') === 'concluido'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Atualizando...
                          </>
                        ) : (
                          `Marcar como ${form.watch('status') === 'concluido' ? 'Concluído' : 'Cancelado'}`
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}