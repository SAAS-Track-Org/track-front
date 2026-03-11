import { useEffect, useRef, useState } from 'react'
import { deliveryService } from '@/services/api/delivery.service'
import { wsService } from '@/services/websocket/wsService'
import type { TrackDeliveryResponse, LocationUpdate } from '@/types/types'

interface UseTrackDeliveryResult {
  delivery: TrackDeliveryResponse | null
  location: LocationUpdate | null
  loading: boolean
  error: string | null
}

export function useTrackDelivery(publicCodeClient: string, orderCode: string): UseTrackDeliveryResult {
  const [delivery, setDelivery] = useState<TrackDeliveryResponse | null>(null)
  const [location, setLocation]  = useState<LocationUpdate | null>(null)
  const [loading, setLoading]    = useState(true)
  const [error, setError]        = useState<string | null>(null)

  const unsubscribeRef = useRef<(() => void) | null>(null)

  // ── Busca dados iniciais ──
  useEffect(() => {
    setLoading(true)
    deliveryService
      .track(publicCodeClient, orderCode)
      .then((data) => {
        setDelivery(data)
        if (data.currentLat && data.currentLng) {
          setLocation({ lat: data.currentLat, lng: data.currentLng })
        }
      })
      .catch(() => setError('Entrega não encontrada'))
      .finally(() => setLoading(false))
  }, [publicCodeClient])

  // ── WebSocket ──
  useEffect(() => {
    wsService.connect(() => {
      unsubscribeRef.current = wsService.subscribeToLocation(publicCodeClient, (loc) => {
        setLocation(loc)
      })
    })

    return () => {
      unsubscribeRef.current?.()
      unsubscribeRef.current = null
      wsService.disconnect()
    }
  }, [publicCodeClient])

  return { delivery, location, loading, error }
}