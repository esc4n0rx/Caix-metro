"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { MovimentoModal } from "@/components/movimento-modal"
import { movimentos } from "@/lib/data"

export default function RegressoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const regressos = movimentos.filter((m) => m.tipo === "regresso")

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
          <h1 className="text-3xl font-bold">Regressos</h1>
          <p className="text-muted-foreground">Gerencie o retorno de ativos das lojas para o CD</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Regresso
        </Button>
      </div>

      <div className="grid gap-4">
        {regressos.map((regresso) => (
          <Card key={regresso.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{regresso.codigo}</CardTitle>
                  <CardDescription>
                    {regresso.origem} → {regresso.destino}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(regresso.status)}>{getStatusText(regresso.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Data:</span> {new Date(regresso.data).toLocaleDateString("pt-BR")}
                </div>
                <div>
                  <span className="font-medium">Usuário:</span> {regresso.usuario}
                </div>
                <div>
                  <span className="font-medium">Itens:</span> {regresso.ativos.length} tipos
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MovimentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tipo="regresso"
        destinoFixo="CD PAVUNA"
      />
    </div>
  )
}
