import { useCallback, useEffect, useState } from 'react'
import { deliveryService } from '@/services/api/delivery.service'
import type { DeliverySummary } from '@/types/types'

interface UseDashboardDeliveriesResult {
  deliveries: DeliverySummary[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDriverDelivery(): UseDashboardDeliveriesResult {
  const [deliveries, setDeliveries] = useState<DeliverySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(() => {
    setLoading(true)
    deliveryService
      .list()
      .then(setDeliveries)
      .catch(() => {
        setDeliveries([])
        setError('Erro ao carregar entregas')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { deliveries, loading, error, refetch: fetch }
}