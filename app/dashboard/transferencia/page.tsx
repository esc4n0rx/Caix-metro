"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { MovimentoModal } from "@/components/movimento-modal"
import { movimentos } from "@/lib/data"

export default function TransferenciaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const transferencias = movimentos.filter((m) => m.tipo === "transferencia")

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transferências</h1>
          <p className="text-muted-foreground">Gerencie transferências de ativos entre centros de distribuição</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Transferência
        </Button>
      </div>

      <div className="grid gap-4">
        {transferencias.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma transferência encontrada. Clique em "Nova Transferência" para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          transferencias.map((transferencia) => (
            <Card key={transferencia.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{transferencia.codigo}</CardTitle>
                    <CardDescription>
                      {transferencia.origem} → {transferencia.destino}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(transferencia.status)}>{getStatusText(transferencia.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Data:</span>{" "}
                    {new Date(transferencia.data).toLocaleDateString("pt-BR")}
                  </div>
                  <div>
                    <span className="font-medium">Usuário:</span> {transferencia.usuario}
                  </div>
                  <div>
                    <span className="font-medium">Itens:</span> {transferencia.ativos.length} tipos
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MovimentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tipo="transferencia" />
    </div>
  )
}
