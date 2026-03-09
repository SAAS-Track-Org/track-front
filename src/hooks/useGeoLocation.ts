import { useEffect, useRef, useState } from 'react'

interface GeoPosition {
  lat: number
  lng: number
}

interface UseGeoLocationResult {
  position: GeoPosition | null
  error: string | null
  watching: boolean
  startWatching: () => void
  stopWatching: () => void
}

export function useGeoLocation(onPosition?: (pos: GeoPosition) => void): UseGeoLocationResult {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [watching, setWatching] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste browser')
      return
    }

    setWatching(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const geoPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(geoPos)
        onPosition?.(geoPos)
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setWatching(false)
  }

  useEffect(() => {
    return () => stopWatching()
  }, [])

  return { position, error, watching, startWatching, stopWatching }
}
