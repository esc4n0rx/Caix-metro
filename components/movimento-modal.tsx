"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { lojas, centrosDistribuicao, tiposAtivos } from "@/lib/data"

interface MovimentoModalProps {
  isOpen: boolean
  onClose: () => void
  tipo: "remessa" | "regresso" | "transferencia"
  origemFixa?: string
  destinoFixo?: string
}

export function MovimentoModal({ isOpen, onClose, tipo, origemFixa, destinoFixo }: MovimentoModalProps) {
  const [origem, setOrigem] = useState(origemFixa || "")
  const [destino, setDestino] = useState(destinoFixo || "")
  const [ativos, setAtivos] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleQuantidadeChange = (tipoId: string, quantidade: string) => {
    const qty = Number.parseInt(quantidade) || 0
    setAtivos((prev) => ({
      ...prev,
      [tipoId]: qty,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      onClose()

      setOrigem(origemFixa || "")
      setDestino(destinoFixo || "")
      setAtivos({})
      alert(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} criada com sucesso!`)
    }, 1000)
  }

  const gerarCodigo = () => {
    const prefixo = tipo === "remessa" ? "REM" : tipo === "regresso" ? "REG" : "TRF"
    const numero = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefixo}-${numero}`
  }

  const getTitulo = () => {
    switch (tipo) {
      case "remessa":
        return "Nova Remessa"
      case "regresso":
        return "Novo Regresso"
      case "transferencia":
        return "Nova Transferência"
      default:
        return "Novo Movimento"
    }
  }

  const getDescricao = () => {
    switch (tipo) {
      case "remessa":
        return "Envie ativos do CD para uma loja"
      case "regresso":
        return "Receba ativos de uma loja para o CD"
      case "transferencia":
        return "Transfira ativos entre centros de distribuição"
      default:
        return "Crie um novo movimento de ativos"
    }
  }

  const getOrigemOptions = () => {
    if (tipo === "remessa") return centrosDistribuicao
    if (tipo === "regresso") return lojas
    return centrosDistribuicao
  }

  const getDestinoOptions = () => {
    if (tipo === "remessa") return lojas
    if (tipo === "regresso") return centrosDistribuicao
    return centrosDistribuicao.filter((cd) => cd.nome !== origem)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitulo()}</DialogTitle>
          <DialogDescription>{getDescricao()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={gerarCodigo()} disabled />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem</Label>
              {origemFixa ? (
                <Input value={origemFixa} disabled />
              ) : (
                <Select value={origem} onValueChange={setOrigem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOrigemOptions().map((item) => (
                      <SelectItem key={item.id} value={item.nome}>
                        {item.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Destino</Label>
              {destinoFixo ? (
                <Input value={destinoFixo} disabled />
              ) : (
                <Select value={destino} onValueChange={setDestino}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDestinoOptions().map((item) => (
                      <SelectItem key={item.id} value={item.nome}>
                        {item.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seleção de Ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tiposAtivos.map((ativo) => (
                <div key={ativo.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{ativo.nome}</span>
                    <span className="text-sm text-muted-foreground ml-2">({ativo.codigo})</span>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={ativos[ativo.id] || ""}
                      onChange={(e) => handleQuantidadeChange(ativo.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !origem || !destino}
              className={
                tipo === "remessa"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : tipo === "regresso"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
              }
            >
              {isLoading ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
