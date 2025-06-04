export interface User {
  id: string
  nome: string
  email: string
  cd: string
  role: 'admin' | 'operador'
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nome: string
  email: string
  password: string
  cd: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}