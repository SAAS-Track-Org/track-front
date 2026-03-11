import { useEffect, useRef, useState } from 'react'
import { trackService } from '@/services/api/track.service'
import { wsService } from '@/services/websocket/wsService'
import type { TrackOrderResponse } from '@/services/api/track.service'
import type { LocationUpdate } from '@/types/types'

interface UseNavigationTrackingResult {
  order: TrackOrderResponse | null
  delivererLocation: LocationUpdate | null
  loading: boolean
  guard: 'NOT_ARRIVING' | 'DELIVERED' | null
}

function distanceInMeters(a: LocationUpdate, b: LocationUpdate): number {
  const R = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x = dLat
  const y = dLng * Math.cos((a.lat * Math.PI) / 180)
  return R * Math.sqrt(x * x + y * y)
}

const MOVEMENT_THRESHOLD_METERS = 10

export function useNavigationTracking(
  publicCodeClient: string,
  orderCode: string,
): UseNavigationTrackingResult {
  const [order, setOrder]                         = useState<TrackOrderResponse | null>(null)
  const [delivererLocation, setDelivererLocation] = useState<LocationUpdate | null>(null)
  const [loading, setLoading]                     = useState(true)
  const [guard, setGuard]                         = useState<'NOT_ARRIVING' | 'DELIVERED' | null>(null)

  const lastLocationRef  = useRef<LocationUpdate | null>(null)
  const unsubscribeRef   = useRef<(() => void) | null>(null)

  // ── 1. Busca pedido + valida guard ──
  useEffect(() => {
    setLoading(true)
    trackService
      .getOrder(publicCodeClient, orderCode)
      .then((data) => {
        setOrder(data)
        if (data.deliveryStatus === 'DELIVERED') {
          setGuard('DELIVERED')
        } else if (data.deliveryStatus !== 'ARRIVING') {
          setGuard('NOT_ARRIVING')
        } else {
          setGuard(null)
          if (data.delivery.currentLat && data.delivery.currentLng) {
            const initial = {
              lat: Number(data.delivery.currentLat),
              lng: Number(data.delivery.currentLng),
            }
            lastLocationRef.current = initial
            setDelivererLocation(initial)
          }
        }
      })
      .catch(() => setGuard('NOT_ARRIVING'))
      .finally(() => setLoading(false))
  }, [publicCodeClient, orderCode])

  // ── 2. WebSocket — conecta e subscreve separadamente ──
  useEffect(() => {
    if (guard !== null) return

    wsService.connect(() => {
      // Callback só roda quando STOMP está de fato conectado
      unsubscribeRef.current = wsService.subscribeToLocation(publicCodeClient, (raw) => {
        const loc: LocationUpdate = {
          lat: typeof raw.lat === 'string' ? parseFloat(raw.lat) : raw.lat,
          lng: typeof raw.lng === 'string' ? parseFloat(raw.lng) : raw.lng,
        }

        const last = lastLocationRef.current
        if (last && distanceInMeters(last, loc) < MOVEMENT_THRESHOLD_METERS) return

        lastLocationRef.current = loc
        setDelivererLocation(loc)
      })
    })

    return () => {
      // Cancela subscrição antes de desconectar
      unsubscribeRef.current?.()
      unsubscribeRef.current = null
      wsService.disconnect()
    }
  }, [publicCodeClient, guard])

  // ── 3. Polling 10s para detectar DELIVERED ──
  useEffect(() => {
    if (guard !== null) return

    const interval = setInterval(async () => {
      try {
        const data = await trackService.getOrder(publicCodeClient, orderCode)
        setOrder(data)
        if (data.deliveryStatus === 'DELIVERED') {
          setGuard('DELIVERED')
          clearInterval(interval)
        }
      } catch { /* ignora */ }
    }, 10_000)

    return () => clearInterval(interval)
  }, [publicCodeClient, orderCode, guard])

  return { order, delivererLocation, loading, guard }
}