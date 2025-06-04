"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Remessa, CreateRemessaData, UpdateRemessaStatusData } from '@/types/remessa'
import { RemessaFiltersData } from '@/lib/validations/remessa'

interface RemessasResponse {
  success: boolean
  data: Remessa[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

interface RemessaResponse {
  success: boolean
  data: Remessa
  message?: string
}

export function useRemessas() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token])

  const fetchRemessas = useCallback(async (filters?: Partial<RemessaFiltersData>) => {
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
        `/api/remessas?${searchParams.toString()}`,
        {
          headers: getHeaders()
        }
      )

      const result: RemessasResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar remessas')
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

  const fetchRemessa = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/remessas/${id}`, {
        headers: getHeaders()
      })

      const result: RemessaResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar remessa')
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

  const createRemessa = useCallback(async (data: CreateRemessaData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/remessas', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      const result: RemessaResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar remessa')
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

  const updateRemessaStatus = useCallback(async (id: string, data: UpdateRemessaStatusData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/remessas/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      const result: RemessaResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar remessa')
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
    fetchRemessas,
    fetchRemessa,
    createRemessa,
    updateRemessaStatus
  }
}