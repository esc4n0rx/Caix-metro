"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useRemessas } from "@/hooks/use-remessas"
import { useAuth } from "@/contexts/auth-context"
import { lojas } from "@/lib/data"
import { z } from "zod"

const basicFormSchema = z.object({
  loja_destino: z.string().min(1, 'Loja de destino é obrigatória'),
  observacoes: z.string().optional()
})

type BasicFormData = z.infer<typeof basicFormSchema>

interface TipoAtivo {
  id: string
  nome: string
  codigo: string
}

interface CreateRemessaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateRemessaModal({ isOpen, onClose, onSuccess }: CreateRemessaModalProps) {
  const [selectedAtivos, setSelectedAtivos] = useState<{ tipo_ativo_id: string; quantidade: number }[]>([])
  const [ativosError, setAtivosError] = useState<string>("")
  const [tiposAtivos, setTiposAtivos] = useState<TipoAtivo[]>([])
  const [loadingTipos, setLoadingTipos] = useState(false)
  const { createRemessa, isLoading, error } = useRemessas()
  const { token } = useAuth()

  const form = useForm<BasicFormData>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      loja_destino: "",
      observacoes: ""
    }
  })

  useEffect(() => {
    const fetchTiposAtivos = async () => {
      if (!isOpen || !token) return

      setLoadingTipos(true)
      try {
        const response = await fetch('/api/tipos-ativos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTiposAtivos(result.data)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de ativos:', error)
      } finally {
        setLoadingTipos(false)
      }
    }

    fetchTiposAtivos()
  }, [isOpen, token])

  const handleAddAtivo = () => {
    setSelectedAtivos(prev => [...prev, { tipo_ativo_id: "", quantidade: 1 }])
    setAtivosError("") 
  }

  const handleRemoveAtivo = (index: number) => {
    setSelectedAtivos(prev => prev.filter((_, i) => i !== index))
    if (selectedAtivos.length === 1) {
      setAtivosError("Pelo menos um ativo deve ser selecionado")
    }
  }

  const handleAtivoChange = (index: number, field: 'tipo_ativo_id' | 'quantidade', value: string | number) => {
    setSelectedAtivos(prev => 
      prev.map((ativo, i) => 
        i === index ? { ...ativo, [field]: value } : ativo
      )
    )
    setAtivosError("")
  }

  const validateAtivos = () => {
    if (selectedAtivos.length === 0) {
      setAtivosError("Pelo menos um ativo deve ser selecionado")
      return false
    }

    const ativosValidos = selectedAtivos.filter(ativo => 
      ativo.tipo_ativo_id && ativo.tipo_ativo_id.trim() !== "" && ativo.quantidade > 0
    )

    if (ativosValidos.length === 0) {
      setAtivosError("Pelo menos um ativo deve ter tipo selecionado e quantidade maior que zero")
      return false
    }

    // Verificar duplicatas
    const tiposSet = new Set()
    for (const ativo of ativosValidos) {
      if (tiposSet.has(ativo.tipo_ativo_id)) {
        setAtivosError("Não é possível selecionar o mesmo tipo de ativo mais de uma vez")
        return false
      }
      tiposSet.add(ativo.tipo_ativo_id)
    }

    return true
  }

  const handleSubmit = async (data: BasicFormData) => {

    if (!validateAtivos()) {
      return
    }

    try {

      const ativosValidos = selectedAtivos.filter(ativo => 
        ativo.tipo_ativo_id && ativo.tipo_ativo_id.trim() !== "" && ativo.quantidade > 0
      )

      await createRemessa({
        loja_destino: data.loja_destino,
        ativos: ativosValidos,
        observacoes: data.observacoes
      })

      onSuccess()
      onClose()
      handleReset()
    } catch (err) {

    }
  }

  const handleReset = () => {
    form.reset()
    setSelectedAtivos([])
    setAtivosError("")
  }

  const handleClose = () => {
    onClose()
    handleReset()
  }

  const tiposDisponiveis = tiposAtivos.filter(tipo => 
    !selectedAtivos.some(ativo => ativo.tipo_ativo_id === tipo.id)
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Remessa</DialogTitle>
          <DialogDescription>
            Crie uma nova remessa de ativos para uma loja
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loadingTipos ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando tipos de ativos...</span>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="loja_destino">Loja de Destino</Label>
              <Select 
                value={form.watch('loja_destino')} 
                onValueChange={(value) => form.setValue('loja_destino', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja de destino" />
                </SelectTrigger>
                <SelectContent>
                  {lojas.map((loja) => (
                    <SelectItem key={loja.id} value={loja.nome}>
                      {loja.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.loja_destino && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.loja_destino.message}
                </p>
              )}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Ativos</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAtivo}
                    disabled={tiposDisponiveis.length === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Ativo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAtivos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum ativo selecionado. Clique em "Adicionar Ativo" para começar.
                  </p>
                ) : (
                  selectedAtivos.map((ativo, index) => (
                    <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Tipo de Ativo</Label>
                        <Select
                          value={ativo.tipo_ativo_id}
                          onValueChange={(value) => handleAtivoChange(index, 'tipo_ativo_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>

                            {ativo.tipo_ativo_id && (
                              <SelectItem value={ativo.tipo_ativo_id}>
                                {tiposAtivos.find(t => t.id === ativo.tipo_ativo_id)?.nome} 
                                ({tiposAtivos.find(t => t.id === ativo.tipo_ativo_id)?.codigo})
                              </SelectItem>
                            )}
                            {tiposDisponiveis.map((tipo) => (
                              <SelectItem key={tipo.id} value={tipo.id}>
                                {tipo.nome} ({tipo.codigo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-32 space-y-2">
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ativo.quantidade}
                          onChange={(e) => handleAtivoChange(index, 'quantidade', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAtivo(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}

                {ativosError && (
                  <p className="text-sm text-destructive">{ativosError}</p>
                )}

                {tiposDisponiveis.length === 0 && selectedAtivos.length > 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Todos os tipos de ativos foram selecionados
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre a remessa..."
                {...form.register("observacoes")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || selectedAtivos.length === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Remessa"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}