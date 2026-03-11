export interface GeocodeAddress {
  street: string
  number: string
  city?: string
  state?: string
}

export interface GeocodeCoordinates {
  lat: number
  lng: number
}

export const geocodeService = {

  // Busca coordenadas a partir de um endereço via Nominatim
  search: async (address: GeocodeAddress): Promise<GeocodeCoordinates | null> => {
    const { street, number, city, state } = address
    const query = encodeURIComponent(
      [street, number, city, state, 'Brasil'].filter(Boolean).join(', ')
    )

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
    )

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`)
    }

    const results = await response.json()
    const [result] = results

    if (!result) {
      console.warn('[geocodeService] Endereço não encontrado:', decodeURIComponent(query))
      return null
    }

    console.log('[geocodeService] Encontrado:', result.display_name)
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }
  },
}