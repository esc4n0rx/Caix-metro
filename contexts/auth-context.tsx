"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User, AuthResponse } from '@/types/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (nome: string, email: string, password: string, cd: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Verificar se há token salvo no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      verifyToken(savedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.user) {
        setUser(result.user)
        setToken(tokenToVerify)
        localStorage.setItem('auth_token', tokenToVerify)
      } else {
        localStorage.removeItem('auth_token')
        setUser(null)
        setToken(null)
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      localStorage.removeItem('auth_token')
      setUser(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.user && result.token) {
        setUser(result.user)
        setToken(result.token)
        localStorage.setItem('auth_token', result.token)
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: 'Erro de conexão' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (nome: string, email: string, password: string, cd: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, password, confirmPassword: password, cd })
      })

      const result: AuthResponse = await response.json()

      if (result.success && result.user && result.token) {
        setUser(result.user)
        setToken(result.token)
        localStorage.setItem('auth_token', result.token)
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, message: 'Erro de conexão' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }, [])

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}