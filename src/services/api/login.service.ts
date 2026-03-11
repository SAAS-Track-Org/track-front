import { api } from './client'
import type {
  LoginRequest,
  LoginResponse,
  AuthConfigResponse,
  UpdateProfileRequest,
  ProfileResponse,
} from '@/types/login.types'

export const authService = {
  // Busca configurações públicas (duração de sessão)
  config: async (): Promise<AuthConfigResponse> => {
    const { headers } = await api.get('/auth/config')
    return {
      sessionDurationHours: Number(headers['x-session-duration-hours']),
    }
  },

  // Login por e-mail
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', payload)
    const token = response.headers['authorization']?.replace('Bearer ', '') ?? ''
    return {
      token,
      email: payload.email,
      sessionDurationHours: Number(response.headers['x-session-duration-hours']),
      expiresAt: response.headers['x-expires-at'] ?? '',
    }
  },

  // Busca perfil do usuário autenticado
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await api.get<ProfileResponse>('/auth/profile')
    return data
  },

  // Atualiza perfil do usuário autenticado
  updateProfile: async (payload: UpdateProfileRequest): Promise<ProfileResponse> => {
    const { data } = await api.put<ProfileResponse>('/auth/profile', payload)
    return data
  },
}