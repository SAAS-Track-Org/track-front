import { api } from './client'

export interface ClientSearchResult {
  id: string
  dataClient: string
  phoneNumber: string
  name: string
}

export const clientService = {
  search: async (q: string): Promise<ClientSearchResult[]> => {
    const { data } = await api.get('/client/search', { params: { q } })
    return data
  },
}
