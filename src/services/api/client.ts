import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
})

// Injeta Authorization e X-User-Id em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (!token) return config

  config.headers['Authorization'] = `Bearer ${token}`

  // Extrai o userId do payload do JWT (sem biblioteca externa)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.userId) {
      config.headers['X-User-Id'] = payload.userId
    }
  } catch {
    console.warn('[api] Não foi possível extrair userId do token')
  }

  return config
})