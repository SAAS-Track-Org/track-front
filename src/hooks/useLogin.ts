import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/api/login.service'
import type { LoginRequest, AuthConfigResponse } from '@/types/user.types'

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

  useEffect(() => {
    authService
      .config()
      .then((config: AuthConfigResponse) => setSessionHours(config.sessionDurationHours))
      .catch(() => setSessionHours(8))
  }, [])

  async function handleLogin(payload: LoginRequest): Promise<void> {
    setSubmitting(true)
    setError(null)

    try {
      const { token } = await authService.login(payload)
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