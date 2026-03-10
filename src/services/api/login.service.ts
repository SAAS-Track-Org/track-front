import { api } from './client'
import type { AuthConfigResponse, LoginRequest, LoginResponse } from '@/types/login.types'

export const loginService = {

  // GET /api/auth/config
  // O backend retorna sessionDurationHours no header X-Session-Duration-Hours
  getConfig: async (): Promise<AuthConfigResponse> => {
    const response = await api.get('/auth/config')
    const sessionDurationHours = Number(response.headers['x-session-duration-hours'])
    return { sessionDurationHours }
  },

  // POST /api/auth/login
  // O backend retorna token, duração e expiração nos headers:
  //   Authorization: Bearer <token>
  //   X-Session-Duration-Hours: 8
  //   X-Expires-At: 2026-03-10T22:00:00Z
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', payload)

    const token = response.headers['authorization']?.replace('Bearer ', '') ?? ''
    const sessionDurationHours = Number(response.headers['x-session-duration-hours'])
    const expiresAt = response.headers['x-expires-at'] ?? ''

    return {
      token,
      email: payload.email,
      sessionDurationHours,
      expiresAt,
    }
  },
}