
"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Regresso, CreateRegressoData, UpdateRegressoStatusData } from '@/types/regresso'
import { RegressoFiltersData } from '@/lib/validations/regresso'

interface RegressosResponse {
  success: boolean
  data: Regresso[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

interface RegressoResponse {
  success: boolean
  data: Regresso
  message?: string
}

export function useRegressos() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token])

  const fetchRegressos = useCallback(async (filters?: Partial<RegressoFiltersData>) => {
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
        `/api/regressos?${searchParams.toString()}`,
        {
          headers: getHeaders()
        }
      )

      const result: RegressosResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar regressos')
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

  const fetchRegresso = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/regressos/${id}`, {
        headers: getHeaders()
      })

      const result: RegressoResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar regresso')
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

  const createRegresso = useCallback(async (data: CreateRegressoData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/regressos', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      const result: RegressoResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar regresso')
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

  const updateRegressoStatus = useCallback(async (id: string, data: UpdateRegressoStatusData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/regressos/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
      })

      const result: RegressoResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar regresso')
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
    fetchRegressos,
    fetchRegresso,
    createRegresso,
    updateRegressoStatus
  }
}