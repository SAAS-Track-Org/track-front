import { OrderDeliveryStatus, PaymentMethod, DeliveryStatus, OrderStatus } from "./enum.types"


// ─── Domain Forms ─────────────────────────────────────────────────────────────

export interface AddressForm {
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface ClientForm {
  id: string | null
  name: string
  phoneNumber: string
}

export interface DeliverymanForm {
  id: string | null
  name: string
  phoneNumber: string
}

export interface ProductForm {
  id: string
  name: string
  description: string
  price: string
  quantity: number
}

export interface OrderForm {
  id: string
  client: ClientForm
  notes: string
  totalAmount?: string
  paymentMethod?: PaymentMethod
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

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface AddressResponse {
  id: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface OrderResponse {
  code: string
  clientName: string
  status: OrderStatus
  address: AddressResponse | null
}

// ─── API Response — Create Delivery ──────────────────────────────────────────

export interface CreateDeliveryResponse {
  deliveryId: string
  publicCodeClient: string
  publicCodeDeliveryman: string
  status: DeliveryStatus
  orders: {
    code: string
    clientName: string
    status: OrderStatus
    address: AddressResponse | null
  }[]
}

// ─── API Response — Dashboard List ───────────────────────────────────────────

export interface DeliveryOrderSummary {
  code: string
  stausAddress: OrderStatus
}

export interface DeliverySummary {
  deliveryId: string
  status: DeliveryStatus
  orders: DeliveryOrderSummary[]
  clientName: string
  deliverymanName: string
  createdAt: string
}

// ─── API Response — Delivery Detail ──────────────────────────────────────────



// ─── API Response — Track (cliente) ──────────────────────────────────────────

export interface TrackDeliveryResponse {
  deliveryId: string
  publicCodeClient: string
  status: DeliveryStatus
  currentLat: number | null
  currentLng: number | null
  orders: OrderResponse[]
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

export interface LocationUpdate {
  lat: number
  lng: number
}

// ─── API Response — Address ───────────────────────────────────────────────────

export interface ClientAddressSummary {
  id: string
  zipCode: string
  street: string
}

// ─── API Response — Product ───────────────────────────────────────────────────

export interface ProductSearchResult {
  id: string
  name: string
  description: string
  price: number
}

// ─── API Response — Deliveryman ───────────────────────────────────────────────

export interface DeliverymanSearchResult {
  id: string
  dataClient: string   // formato: "Nome — telefone"
  name: string
  phoneNumber: string
}

// ─── API Response — Client ────────────────────────────────────────────────────

export interface ClientSearchResult {
  id: string
  dataClient: string   // formato: "telefone — Nome"
  name: string
  phoneNumber: string
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'RESTAURANT' | 'DELIVERYMAN'
  token: string
}

// ─── API Response — Driver (entregador) ──────────────────────────────────────

export interface AddressDetail {
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}