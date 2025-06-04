// hooks/use-upload-movimentos.ts
"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { UploadResult, UploadProgress } from '@/types/upload'

interface UploadResponse {
  success: boolean
  data?: UploadResult
  message?: string
}

export function useUploadMovimentos() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const getHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`
  }), [token])

  const uploadMovimentos = useCallback(async (
    file: File, 
    tipo: 'remessa' | 'regresso' | 'transferencia'
  ) => {
    setIsLoading(true)
    setError(null)
    setProgress({
      total: 100,
      current: 0,
      status: 'uploading',
      message: 'Iniciando upload...'
    })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tipo', tipo)

      // Simula progresso de upload
      const uploadInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev || prev.current >= 30) return prev
          return {
            ...prev,
            current: prev.current + 5,
            message: 'Enviando arquivo...'
          }
        })
      }, 200)

      const response = await fetch('/api/upload-movimentos', {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      })

      clearInterval(uploadInterval)

      setProgress(prev => prev ? {
        ...prev,
        current: 40,
        status: 'processing',
        message: 'Processando planilha...'
      } : null)

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result: UploadResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erro ao processar upload')
      }

      // Simula progresso de processamento
      const processingInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev || prev.current >= 90) {
            clearInterval(processingInterval)
            return prev
          }
          return {
            ...prev,
            current: prev.current + 10,
            message: 'Criando movimentos...'
          }
        })
      }, 500)

      setTimeout(() => {
        clearInterval(processingInterval)
        setProgress(prev => prev ? {
          ...prev,
          current: 100,
          status: 'completed',
          message: 'Upload concluído com sucesso!'
        } : null)
      }, 2000)

      return result.data!

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      setProgress(prev => prev ? {
        ...prev,
        status: 'error',
        message: `Erro: ${errorMessage}`
      } : null)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getHeaders])

  const downloadTemplate = useCallback(async (tipo: 'remessa' | 'regresso' | 'transferencia') => {
    try {
      const response = await fetch(`/api/upload-movimentos/template?tipo=${tipo}`, {
        headers: getHeaders()
      })

      if (!response.ok) {
        throw new Error('Erro ao baixar template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `template_${tipo}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
      throw err
    }
  }, [getHeaders])

  const resetProgress = useCallback(() => {
    setProgress(null)
    setError(null)
  }, [])

  return {
    isLoading,
    progress,
    error,
    uploadMovimentos,
    downloadTemplate,
    resetProgress
  }
}