"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { usuarios, lojas, centrosDistribuicao, tiposAtivos } from "@/lib/data"
import { Users, Store, Building2, Package, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Garantir que o componente só renderize depois de montado para evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
  }, [])

  // Função para alternar o tema
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie usuários, lojas, centros de distribuição e tipos de ativos</p>
      </div>

      <div className="grid gap-6">
        {/* Configurações de Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Aparência
            </CardTitle>
            <CardDescription>Personalize a aparência do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Modo Escuro</Label>
                <div className="text-sm text-muted-foreground">Alterne entre o tema claro e escuro</div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Alternar tema" />
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              Tema atual: <Badge variant="outline">{theme === "dark" ? "Escuro" : "Claro"}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários
            </CardTitle>
            <CardDescription>Gerencie os usuários do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{usuario.nome}</div>
                  <div className="text-sm text-muted-foreground">{usuario.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={usuario.role === "admin" ? "default" : "secondary"}>
                    {usuario.role === "admin" ? "Administrador" : "Operador"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
            <Button className="w-full">Adicionar Usuário</Button>
          </CardContent>
        </Card>

        {/* Lojas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Lojas
            </CardTitle>
            <CardDescription>Gerencie as lojas da rede</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lojas.map((loja) => (
                <div key={loja.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{loja.nome}</div>
                  <div className="text-sm text-muted-foreground">ID: {loja.id}</div>
                </div>
              ))}
            </div>
            <Button className="w-full">Adicionar Loja</Button>
          </CardContent>
        </Card>

        {/* Centros de Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Centros de Distribuição
            </CardTitle>
            <CardDescription>Gerencie os centros de distribuição</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {centrosDistribuicao.map((cd) => (
                <div key={cd.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{cd.nome}</div>
                  <div className="text-sm text-muted-foreground">ID: {cd.id}</div>
                </div>
              ))}
            </div>
            <Button className="w-full">Adicionar CD</Button>
          </CardContent>
        </Card>

        {/* Tipos de Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tipos de Ativos
            </CardTitle>
            <CardDescription>Gerencie os tipos de ativos reutilizáveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tiposAtivos.map((ativo) => (
              <div key={ativo.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{ativo.nome}</div>
                  <div className="text-sm text-muted-foreground">Código: {ativo.codigo}</div>
                </div>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            ))}
            <Button className="w-full">Adicionar Tipo de Ativo</Button>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>Ajustes gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Nome da Empresa</Label>
                <Input id="empresa" defaultValue="Hortifruti Natural da Terra" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="versao">Versão do Sistema</Label>
                <Input id="versao" defaultValue="1.0.0" disabled />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button>Salvar Configurações</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
