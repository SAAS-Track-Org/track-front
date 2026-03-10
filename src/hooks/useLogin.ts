import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginService } from '@/services/api/login.service'
import type { LoginRequest } from '@/types/login.types'

interface UseLoginResult {
  sessionHours: number | null
  submitting: boolean
  error: string | null
  handleLogin: (payload: LoginRequest) => Promise<void>
}

export function useLogin(): UseLoginResult {
  const navigate = useNavigate()

  const [sessionHours, setSessionHours] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Busca o tempo de sessão ao montar — lê do header X-Session-Duration-Hours
  useEffect(() => {
    loginService
      .getConfig()
      .then((config) => setSessionHours(config.sessionDurationHours))
      .catch(() => setSessionHours(8)) // fallback seguro
  }, [])

  async function handleLogin(payload: LoginRequest): Promise<void> {
    setSubmitting(true)
    setError(null)

    try {
      const { token } = await loginService.login(payload)
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch {
      setError('Não foi possível fazer login. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return { sessionHours, submitting, error, handleLogin }
}