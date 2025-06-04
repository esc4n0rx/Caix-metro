"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'

export interface Usuario {
  id: string
  nome: string
  email: string
  cd: string
  role: 'admin' | 'operador'
  created_at: string
  updated_at: string
}

export interface CreateUsuarioData {
  nome: string
  email: string
  password: string
  cd: string
  role: 'admin' | 'operador'
}

export interface UpdateUsuarioData {
  nome?: string
  email?: string
  cd?: string
  role?: 'admin' | 'operador'
}

interface UsuariosResponse {
  success: boolean
  data: Usuario[]
  message?: string
}

interface UsuarioResponse {
  success: boolean
  data: Usuario
  message?: string
}

export function useUsuarios() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token])

  const fetchUsuarios = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/usuarios', {
        headers: getHeaders()
      })

      const result: UsuariosResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar usuários')
      }

      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getHeaders])

  const createUsuario = useCallback(async (data: CreateUsuarioData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      const result: UsuarioResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar usuário')
      }

      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getHeaders])

  const updateUsuario = useCallback(async (id: string, data: UpdateUsuarioData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      const result: UsuarioResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar usuário')
      }

      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getHeaders])

  const deleteUsuario = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao excluir usuário')
      }

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getHeaders])

  return {
    isLoading,
    error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario
  }
}