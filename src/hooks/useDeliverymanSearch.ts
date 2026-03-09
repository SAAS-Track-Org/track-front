import { useEffect, useRef, useState } from 'react'
import { deliverymanService, type DeliverymanSearchResult } from '@/services/api/deliveryman.service'

interface UseDeliverymanSearchResult {
  query: string
  setQuery: (q: string, skipSearch?: boolean) => void
  results: DeliverymanSearchResult[]
  loading: boolean
  open: boolean
  setOpen: (v: boolean) => void
}

export function useDeliverymanSearch(): UseDeliverymanSearchResult {
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<DeliverymanSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipRef = useRef(false) // flag: ignora o próximo useEffect

  const setQuery = (q: string, skipSearch = false) => {
    if (skipSearch) skipRef.current = true
    setQueryState(q)
  }

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false
      return
    }

    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await deliverymanService.search(query)
        setResults(data)
        setOpen(data.length > 0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return { query, setQuery, results, loading, open, setOpen }
}