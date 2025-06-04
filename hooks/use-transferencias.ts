"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Transferencia, CreateTransferenciaData, UpdateTransferenciaStatusData } from '@/types/transferencia'
import { TransferenciaFiltersData } from '@/lib/validations/transferencia'

interface TransferenciasResponse {
  success: boolean
  data: Transferencia[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

interface TransferenciaResponse {
  success: boolean
  data: Transferencia
  message?: string
}

export function useTransferencias() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token])

  const fetchTransferencias = useCallback(async (filters?: Partial<TransferenciaFiltersData>) => {
    setIsLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString())
          }
        })
      }

      const response = await fetch(
        `/api/transferencias?${searchParams.toString()}`,
        {
          headers: getHeaders()
        }
      )

      const result: TransferenciasResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar transferências')
      }

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getHeaders])

  const fetchTransferencia = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/transferencias/${id}`, {
        headers: getHeaders()
      })

      const result: TransferenciaResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar transferência')
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

  const createTransferencia = useCallback(async (data: CreateTransferenciaData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transferencias', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      const result: TransferenciaResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar transferência')
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

  const updateTransferenciaStatus = useCallback(async (id: string, data: UpdateTransferenciaStatusData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/transferencias/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      const result: TransferenciaResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar transferência')
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

  return {
    isLoading,
    error,
    fetchTransferencias,
    fetchTransferencia,
    createTransferencia,
    updateTransferenciaStatus
  }
}