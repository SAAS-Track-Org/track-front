import { useEffect, useState } from 'react'
import { productService, type ProductSearchResult } from '@/services/api/product.service'

interface UseProductSearchResult {
  query: string
  setQuery: (q: string, skip?: boolean) => void
  results: ProductSearchResult[]
  loading: boolean
  open: boolean
  setOpen: (v: boolean) => void
}

export function useProductSearch(): UseProductSearchResult {
  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState<ProductSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Carrega todos os produtos uma única vez ao montar
  useEffect(() => {
    setLoading(true)
    productService.getAll()
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false))
  }, [])

  // Filtra localmente — sem novas requests
  const results = query.length < 2
    ? allProducts
    : allProducts.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      )

  const handleSetQuery = (q: string) => {
    setQuery(q)
  }

  return { query, setQuery: handleSetQuery, results, loading, open, setOpen }
}