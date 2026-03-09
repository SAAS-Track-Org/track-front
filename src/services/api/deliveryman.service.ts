import { api } from './client'

export interface DeliverymanSearchResult {
  id: string
  deliveryMenName : string // nome do entregador para exibir no combo
  dataDeliveryMen: string // nome ou telefone exibido no combo
}

export interface DeliverymanDetail {
  id: string
  name: string
  phoneNumber: string
}

export const deliverymanService = {

  // Busca por nome ou telefone (mínimo 2 caracteres)
  search: async (q: string): Promise<DeliverymanSearchResult[]> => {
    const { data } = await api.get('/deliveryman/search', { params: { q } })
    return data
  },

  // Busca detalhes completos pelo ID
  findById: async (id: string): Promise<DeliverymanDetail> => {
    const { data } = await api.get(`/deliveryman/${id}`)
    return data
  },
}
