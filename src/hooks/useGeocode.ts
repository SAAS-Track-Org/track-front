import { useEffect, useState } from 'react'
import { geocodeService } from '@/services/api/geocode.service'
import type { GeocodeAddress, GeocodeCoordinates } from '@/services/api/geocode.service'

interface UseGeocodeResult {
  coords: GeocodeCoordinates | null
  loading: boolean
  error: string | null
}

export function useGeocode(address: GeocodeAddress | null | undefined): UseGeocodeResult {
  const [coords, setCoords]   = useState<GeocodeCoordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!address?.street || !address?.number) return

    setLoading(true)
    setError(null)

    geocodeService
      .search(address)
      .then((result) => {
        if (!result) {
          setError('Endereço não encontrado')
          return
        }
        setCoords(result)
      })
      .catch(() => setError('Erro ao buscar endereço'))
      .finally(() => setLoading(false))
  }, [address?.street, address?.number, address?.city, address?.state])

  return { coords, loading, error }
}