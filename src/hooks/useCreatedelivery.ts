import { useEffect, useRef, useState } from 'react'
import { deliveryService } from '@/services/api/delivery.service'
import type { CreateDeliveryResponse } from '@/types/delivery.types'

interface UseCreateDeliveryResult {
  response: CreateDeliveryResponse | null
  loading: boolean
  error: string | null
  retry: () => void
}

export function useCreateDelivery(): UseCreateDeliveryResult {
  const [response, setResponse] = useState<CreateDeliveryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const calledRef = useRef(false)

  const create = () => {
    setLoading(true)
    setError(null)
    deliveryService
      .create()
      .then(setResponse)
      .catch(() => setError('Erro ao criar entrega'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    create()
  }, [])

  return { response, loading, error, retry: create }
}