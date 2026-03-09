import { api } from './client'

export interface ProductSearchResult {
  id: string
  name: string
  description: string
  price: number
}

export const productService = {
  // Busca todos os produtos uma única vez
  getAll: async (): Promise<ProductSearchResult[]> => {
    const { data } = await api.get('/product')
    return data
  },
}