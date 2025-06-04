import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image src="/images/fundo-login.png" alt="Bem-vindo ao CD" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-white">Bem-vindo ao Sistema de Controle de Ativos</h1>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Escolha uma opção para começar</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Gerencie remessas, regressos e transferências de ativos reutilizáveis entre o centro de distribuição e
                as lojas da rede Hortifruti Natural da Terra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500">
                <CardContent className="p-0">
                  <h3 className="font-semibold text-orange-600">Remessas</h3>
                  <p className="text-sm text-muted-foreground">Envie ativos para as lojas</p>
                </CardContent>
              </Card>

              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
                <CardContent className="p-0">
                  <h3 className="font-semibold text-green-600">Regressos</h3>
                  <p className="text-sm text-muted-foreground">Receba ativos das lojas</p>
                </CardContent>
              </Card>

              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
                <CardContent className="p-0">
                  <h3 className="font-semibold text-purple-600">Transferências</h3>
                  <p className="text-sm text-muted-foreground">Transfira entre CDs</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
