// hooks/use-relatorios.ts
"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { RelatorioCompleto, RelatorioFilters } from '@/types/relatorio'
import { RelatorioFiltersData } from '@/lib/validations/relatorio'

interface RelatoriosResponse {
  success: boolean
  data: RelatorioCompleto
  message?: string
}

export function useRelatorios() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token])

  const fetchRelatorio = useCallback(async (filters?: Partial<RelatorioFiltersData>) => {
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
        `/api/relatorios?${searchParams.toString()}`,
        {
          headers: getHeaders()
        }
      )

      const result: RelatoriosResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar relatório')
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

  const exportarRelatorio = useCallback(async (filters?: Partial<RelatorioFiltersData>, formato: 'xlsx' | 'csv' = 'xlsx') => {
    setIsLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      searchParams.append('formato', formato)
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString())
          }
        })
      }

      const response = await fetch(
        `/api/relatorios/export?${searchParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao exportar relatório')
      }

      // Criar blob e download do arquivo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Obter nome do arquivo do header ou usar nome padrão
      const contentDisposition = response.headers.get('content-disposition')
      let filename = `relatorio_movimentos_${new Date().toISOString().split('T')[0]}.${formato}`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getHeaders, token])

  return {
    isLoading,
    error,
    fetchRelatorio,
    exportarRelatorio
  }
}