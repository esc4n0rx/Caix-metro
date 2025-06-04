import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function SobrePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sobre o Sistema</h1>
        <p className="text-muted-foreground">Informações sobre o sistema de controle de ativos</p>
      </div>

      <div className="grid gap-6">

        <Card>
          <CardContent className="p-0">
            <div className="relative w-full h-64 rounded-t-lg overflow-hidden">
              <Image src="/images/hero-bg.png" alt="Hortifruti Natural da Terra" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-2">Sistema de Controle de Ativos</h2>
                  <p className="text-lg">Hortifruti Natural da Terra</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>Detalhes técnicos e versão atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Versão:</span>
                  <div className="text-muted-foreground">1.0.0</div>
                </div>
                <div>
                  <span className="font-medium">Última Atualização:</span>
                  <div className="text-muted-foreground">Junho 2025</div>
                </div>
                <div>
                  <span className="font-medium">Tecnologia:</span>
                  <div className="text-muted-foreground">Next.js + TypeScript</div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className="bg-green-500">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades</CardTitle>
              <CardDescription>Principais recursos do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Controle de remessas para lojas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Gestão de regressos das lojas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Transferências entre CDs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Relatórios e estatísticas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  Gerenciamento de usuários
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Finalidade do Sistema</CardTitle>
            <CardDescription>Objetivo e benefícios da solução</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              O Sistema de Controle de Ativos foi desenvolvido especificamente para otimizar a gestão de ativos
              reutilizáveis (caixas, pallets e sacos) nos centros de distribuição da rede Hortifruti Natural da Terra.
            </p>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-orange-600 mb-2">Eficiência</div>
                <p className="text-sm text-muted-foreground">Controle automatizado de movimentações</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 mb-2">Rastreabilidade</div>
                <p className="text-sm text-muted-foreground">Histórico completo de todos os ativos</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-purple-600 mb-2">Sustentabilidade</div>
                <p className="text-sm text-muted-foreground">Reutilização responsável de recursos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresa</CardTitle>
            <CardDescription>Informações sobre a Hortifruti Natural da Terra</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8 py-8">
              <div className="text-center">
                <div className="bg-white rounded-lg p-4 shadow-lg mb-4">
                  <span className="text-3xl font-bold text-orange-600">HORTIFRUTI - NATURAL DA TERRA</span>
                </div>
                <p className="text-sm text-muted-foreground">Marca Principal</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Sistema desenvolvido para otimizar a logística de ativos reutilizáveis
              </p>
              <p className="text-xs text-muted-foreground">
                © 2025 Hortifruti Natural da Terra. Todos os direitos reservados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
