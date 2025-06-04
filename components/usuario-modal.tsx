"use client"

import React, { useState, useEffect } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"

import { centrosDistribuicao } from "@/lib/data" 
import { Usuario, CreateUsuarioData, UpdateUsuarioData } from "@/hooks/use-usuarios" 


const baseUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cd: z.string().min(1, 'CD é obrigatório'),
  role: z.enum(['admin', 'operador'], { required_error: 'Tipo de usuário é obrigatório' })
})

const createUsuarioSchema = baseUsuarioSchema.extend({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const updateUsuarioSchema = baseUsuarioSchema

type CreateUsuarioFormData = z.infer<typeof createUsuarioSchema>
type UpdateUsuarioFormData = z.infer<typeof updateUsuarioSchema> 


type FormDataType = CreateUsuarioFormData;

interface UsuarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onSubmit: (data: CreateUsuarioData | UpdateUsuarioData) => Promise<void>
  usuario?: Usuario | null
  isLoading: boolean
  error: string | null
}

export function UsuarioModal({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
  usuario,
  isLoading,
  error
}: UsuarioModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isEditing = !!usuario

  const form = useForm<FormDataType>({
    resolver: zodResolver(isEditing ? updateUsuarioSchema : createUsuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
      cd: "",
      role: "operador"
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (isEditing && usuario) {
        form.reset({
          nome: usuario.nome,
          email: usuario.email,
          password: "", 
          cd: usuario.cd,
          role: usuario.role
        })
      } else {
        form.reset({
          nome: "",
          email: "",
          password: "",
          cd: "",
          role: "operador"
        })
      }
      form.clearErrors();
    }
  }, [isOpen, usuario, isEditing, form])

  const handleFormSubmit: SubmitHandler<FormDataType> = async (data) => {
    try {
      let submissionData: CreateUsuarioData | UpdateUsuarioData

      if (isEditing) {
        const { password, ...updateData } = data
        submissionData = updateData as UpdateUsuarioData 
      } else {
        submissionData = data as CreateUsuarioData
      }

      await onSubmit(submissionData)
      onSuccess()
      handleCloseModal()
    } catch (err) {
    }
  }

  const handleCloseModal = () => {
    onClose()
    form.reset() 
    setShowPassword(false) 
  }


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere as informações do usuário.'
              : 'Preencha os dados para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              {...form.register("nome")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.nome}
            />
            {form.formState.errors.nome && (
              <p className="text-sm text-destructive">
                {form.formState.errors.nome.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  disabled={isLoading}
                  aria-invalid={!!form.formState.errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cd">Centro de Distribuição</Label>
            <Select
              value={form.watch("cd")}
              onValueChange={(value) => form.setValue("cd", value, { shouldValidate: true })}
              disabled={isLoading}
            >
              <SelectTrigger id="cd" aria-invalid={!!form.formState.errors.cd}>
                <SelectValue placeholder="Selecione o CD" />
              </SelectTrigger>
              <SelectContent>
                {centrosDistribuicao.map((cd) => (
                  <SelectItem key={cd.id} value={cd.nome}>
                    {cd.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.cd && (
              <p className="text-sm text-destructive">
                {form.formState.errors.cd.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(value: 'admin' | 'operador') => form.setValue("role", value, { shouldValidate: true })}
              disabled={isLoading}
            >
              <SelectTrigger id="role" aria-invalid={!!form.formState.errors.role}>
                {/* O SelectValue mostrará o valor 'operador' ou 'admin' diretamente, 
                    ou o texto do SelectItem correspondente se encontrado.
                    Para exibir 'Operador'/'Administrador' aqui, precisaria de um mapeamento. */}
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operador">Operador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !form.formState.isDirty && isEditing}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Salvando...' : 'Criando...'}
                </>
              ) : (
                isEditing ? 'Salvar Alterações' : 'Criar Usuário'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}