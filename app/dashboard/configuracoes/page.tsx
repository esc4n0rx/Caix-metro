
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Moon, 
  Sun, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Shield, 
  User,
  Calendar
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { useUsuarios, Usuario, CreateUsuarioData, UpdateUsuarioData } from "@/hooks/use-usuarios"
import { UsuarioModal } from "@/components/usuario-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>("")

  const { 
    fetchUsuarios, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario, 
    isLoading, 
    error 
  } = useUsuarios()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsuarios()
    }
  }, [user])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const loadUsuarios = async () => {
    try {
      const data = await fetchUsuarios()
      setUsuarios(data)
    } catch (err) {
      // Erro já tratado no hook
    }
  }

  const handleCreateUsuario = async (data: CreateUsuarioData) => {
    try {
      await createUsuario(data)
      await loadUsuarios()
      setSuccessMessage("Usuário criado com sucesso!")
    } catch (err) {
      throw err
    }
  }

  const handleUpdateUsuario = async (data: UpdateUsuarioData) => {
    if (!selectedUsuario) return
    
    try {
      await updateUsuario(selectedUsuario.id, data)
      await loadUsuarios()
      setSuccessMessage("Usuário atualizado com sucesso!")
    } catch (err) {
      throw err
    }
  }

  const handleDeleteUsuario = async () => {
    if (!usuarioToDelete) return

    try {
      await deleteUsuario(usuarioToDelete.id)
      await loadUsuarios()
      setUsuarioToDelete(null)
      setSuccessMessage("Usuário excluído com sucesso!")
    } catch (err) {

    }
  }

  const openCreateModal = () => {
    setSelectedUsuario(null)
    setIsModalOpen(true)
  }

  const openEditModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    setIsModalOpen(false)
    setSelectedUsuario(null)
  }

  const handleModalSubmit = async (data: CreateUsuarioData | UpdateUsuarioData) => {
    if (selectedUsuario) {
      await handleUpdateUsuario(data as UpdateUsuarioData)
    } else {
      await handleCreateUsuario(data as CreateUsuarioData)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-blue-500' : 'bg-green-500'
  }

  const getRoleText = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Operador'
  }

  const canDeleteUser = (usuario: Usuario) => {

    return usuario.id !== user?.id
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>


      {successMessage && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
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
            <div className="text-sm text-muted-foreground pt-2 border-t">
              Tema atual: <Badge variant="outline">{theme === "dark" ? "Escuro" : "Claro"}</Badge>
            </div>
          </CardContent>
        </Card>

        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription>Gerencie os usuários do sistema (apenas administradores)</CardDescription>
                </div>
                <Button onClick={openCreateModal} disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && usuarios.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando usuários...</span>
                </div>
              ) : usuarios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado.
                </div>
              ) : (
                usuarios.map((usuario) => (
                  <div 
                    key={usuario.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{usuario.nome}</span>
                        {usuario.id === user?.id && (
                          <Badge variant="outline" className="text-xs">Você</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{usuario.email}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>CD: {usuario.cd}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Criado: {formatDate(usuario.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(usuario.role)}>
                        {usuario.role === 'admin' ? (
                          <Shield className="mr-1 h-3 w-3" />
                        ) : (
                          <User className="mr-1 h-3 w-3" />
                        )}
                        {getRoleText(usuario.role)}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(usuario)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        
                        {canDeleteUser(usuario) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUsuarioToDelete(usuario)}
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {user?.role !== 'admin' && (
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
              <p className="text-muted-foreground">
                Apenas administradores podem acessar as configurações avançadas do sistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        onSubmit={handleModalSubmit}
        usuario={selectedUsuario}
        isLoading={isLoading}
        error={error}
      />

     <AlertDialog open={!!usuarioToDelete} onOpenChange={() => setUsuarioToDelete(null)}>
       <AlertDialogContent>
         <AlertDialogHeader>
           <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
           <AlertDialogDescription>
             Tem certeza que deseja excluir o usuário <strong>{usuarioToDelete?.nome}</strong>?
             Esta ação não pode ser desfeita.
           </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
           <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
           <AlertDialogAction
             onClick={handleDeleteUsuario}
             disabled={isLoading}
             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
           >
             {isLoading ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Excluindo...
               </>
             ) : (
               'Excluir Usuário'
             )}
           </AlertDialogAction>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>
   </div>
 )
}
