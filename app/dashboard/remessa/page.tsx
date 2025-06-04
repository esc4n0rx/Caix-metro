"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { MovimentoModal } from "@/components/movimento-modal"
import { movimentos } from "@/lib/data"

export default function RemessaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const remessas = movimentos.filter((m) => m.tipo === "remessa")

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
          <h1 className="text-3xl font-bold">Remessas</h1>
          <p className="text-muted-foreground">Gerencie o envio de ativos do CD para as lojas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Remessa
        </Button>
      </div>

      <div className="grid gap-4">
        {remessas.map((remessa) => (
          <Card key={remessa.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{remessa.codigo}</CardTitle>
                  <CardDescription>
                    {remessa.origem} → {remessa.destino}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(remessa.status)}>{getStatusText(remessa.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Data:</span> {new Date(remessa.data).toLocaleDateString("pt-BR")}
                </div>
                <div>
                  <span className="font-medium">Usuário:</span> {remessa.usuario}
                </div>
                <div>
                  <span className="font-medium">Itens:</span> {remessa.ativos.length} tipos
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MovimentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tipo="remessa"
        origemFixa="CD PAVUNA"
      />
    </div>
  )
}
