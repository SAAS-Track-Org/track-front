import { api } from './client'
import type { AddressDetail, PaymentMethod, DeliveryStatus } from '@/types'

export interface TrackOrderResponse {
  orderCode: string
  clientName: string | null
  clientPhone: string | null
  deliveryStatus: string
  addressStatus: 'ADDRESS_PENDING' | 'ADDRESS_CONFIRMED'
  address: AddressDetail | null
  paymentMethod: PaymentMethod | null
  totalAmount: number | null
  notes: string | null
  delivery: {
    deliveryId: string
    publicCodeClient: string
    status: DeliveryStatus
    currentLat: number | null
    currentLng: number | null
  }
}

export interface SaveClientDataRequest {
  address: AddressDetail
  paymentMethod: PaymentMethod | null
}

export const trackService = {
  getOrder: async (
    publicCodeClient: string,
    orderCode: string,
  ): Promise<TrackOrderResponse> => {
    const { data } = await api.get(`/track/${publicCodeClient}/${orderCode}`)
    return data
  },

  saveClientData: async (
    publicCodeClient: string,
    orderCode: string,
    payload: SaveClientDataRequest,
  ): Promise<void> => {
    await api.patch(`/track/${publicCodeClient}/${orderCode}`, payload)
  },
}