import { useEffect, useState } from 'react'
import { deliveryService } from '@/services/api/delivery.service'
import { wsService } from '@/services/websocket/wsService'
import type { TrackDeliveryResponse, LocationUpdate } from '@/types'

interface UseTrackDeliveryResult {
  delivery: TrackDeliveryResponse | null
  location: LocationUpdate | null
  loading: boolean
  error: string | null
}

export function useTrackDelivery(publicCodeClient: string): UseTrackDeliveryResult {
  const [delivery, setDelivery] = useState<TrackDeliveryResponse | null>(null)
  const [location, setLocation] = useState<LocationUpdate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Busca dados iniciais
  useEffect(() => {
    setLoading(true)
    deliveryService
      .track(publicCodeClient)
      .then((data) => {
        setDelivery(data)
        // Seta localização inicial se já existir
        if (data.currentLat && data.currentLng) {
          setLocation({ lat: data.currentLat, lng: data.currentLng })
        }
      })
      .catch(() => setError('Entrega não encontrada'))
      .finally(() => setLoading(false))
  }, [publicCodeClient])

  // Conecta WebSocket e assina canal de localização
  useEffect(() => {
    wsService.connect(() => {
      const unsubscribe = wsService.subscribeToLocation(publicCodeClient, (loc) => {
        setLocation(loc)
      })
      return unsubscribe
    })

    return () => wsService.disconnect()
  }, [publicCodeClient])

  return { delivery, location, loading, error }
}
