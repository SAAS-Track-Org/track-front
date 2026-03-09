import { useEffect, useRef, useState } from 'react'

export interface AddressSuggestion {
  displayName: string  // rua completa para mostrar no dropdown
  street: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

interface UseAddressSearchResult {
  query: string
  setQuery: (q: string, skip?: boolean) => void
  suggestions: AddressSuggestion[]
  loading: boolean
  open: boolean
  setOpen: (v: boolean) => void
}

export function useAddressSearch(): UseAddressSearchResult {
  const [query, setQueryState] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipRef = useRef(false)

  const setQuery = (q: string, skip = false) => {
    if (skip) skipRef.current = true
    setQueryState(q)
  }

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false
      return
    }

    if (query.length < 4) {
      setSuggestions([])
      setOpen(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search')
        url.searchParams.set('q', `${query}, Brasil`)
        url.searchParams.set('format', 'json')
        url.searchParams.set('addressdetails', '1')
        url.searchParams.set('limit', '6')
        url.searchParams.set('countrycodes', 'br')

        const res = await fetch(url.toString(), {
          headers: { 'Accept-Language': 'pt-BR' }
        })
        const data = await res.json()

        const results: AddressSuggestion[] = data
          .filter((item: any) => item.address?.road)
          .map((item: any) => ({
            displayName: [
              item.address.road,
              item.address.suburb ?? item.address.neighbourhood ?? item.address.quarter ?? '',
              item.address.city ?? item.address.town ?? item.address.municipality ?? '',
              item.address.state ?? '',
              item.address.postcode ?? '',
            ].filter(Boolean).join(', '),
            street: item.address.road ?? '',
            neighborhood: item.address.suburb ?? item.address.neighbourhood ?? item.address.quarter ?? '',
            city: item.address.city ?? item.address.town ?? item.address.municipality ?? '',
            state: item.address.state_code?.replace('BR-', '') ?? item.address.state ?? '',
            zipCode: (item.address.postcode ?? '').replace('-', ''),
          }))

        setSuggestions(results)
        setOpen(results.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 500) // 500ms — Nominatim pede para não exceder 1 req/s

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return { query, setQuery, suggestions, loading, open, setOpen }
}