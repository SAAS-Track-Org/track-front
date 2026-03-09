// ─── Wizard State ─────────────────────────────────────────────────────────────

export interface DeliverymanForm {
  id: string | null
  name: string
  phoneNumber: string
}

export interface ClientForm {
  id: string | null
  name: string
  phoneNumber: string
}

export interface OrderForm {
  id: string
  client: ClientForm
  notes: string
}

export interface CreateDeliveryForm {
  deliveryman: DeliverymanForm
  orders: OrderForm[]
}

// ─── API Payload ──────────────────────────────────────────────────────────────

export interface CreateDeliveryPayload {
  deliveryman: {
    id: string | null
    name: string
    phoneNumber: string
  }
  orders: {
    client: {
      id: string | null
      name: string
      phoneNumber: string
    }
    notes: string
  }[]
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface CreateDeliveryResponse {
  deliveryId: string
  publicCodeClient: string
  publicCodeDeliveryman: string
  status: 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  orders: {
    code: string
    clientName: string
    status: 'ADDRESS_PENDING' | 'ADDRESS_CONFIRMED'
    address: {
      id: string
      street: string
      number: string
      complement: string
      neighborhood: string
      city: string
      state: string
      zipCode: string
      country: string
    } | null
  }[]
}