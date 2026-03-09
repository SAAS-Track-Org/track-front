// ─── Enums ────────────────────────────────────────────────────────────────────

export type DeliveryStatus =
  | 'CREATED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'

export type OrderStatus = 'ADDRESS_PENDING' | 'ADDRESS_CONFIRMED'

export type OrderDeliveryStatus =
  | 'WAITING'
  | 'ON_THE_WAY'
  | 'ARRIVING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'DELETED'
  | 'STANDBY'

export type PaymentMethod =
  | 'CASH'
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'MEAL_VOUCHER'
  | 'FOOD_VOUCHER'

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

export interface OrderDetail {
  code: string
  clientName: string | null
  clientPhone: string | null
  addressStatus: OrderStatus
  deliveryStatus: OrderDeliveryStatus
  notes: string | null
  totalAmount: number | null
  paymentMethod: PaymentMethod | null
  address: AddressDetail | null
}

export interface StandbyOrderSummary {
  code: string
  clientName: string | null
  deliveryId: string
  label: string
}

export interface DeliveryDetailResponse {
  deliveryId: string
  publicCodeClient: string
  publicCodeDeliveryman: string
  status: DeliveryStatus
  deliverymanName: string
  deliverymanPhone: string | null
  createdAt: string
  orders: OrderDetail[]
}

export interface UpdateOrderRequest {
  clientName: string | null
  clientPhone: string | null
  notes: string | null
  totalAmount: number | null
  paymentMethod: PaymentMethod | null
  address: AddressDetail | null
}

export interface DeliveryDetailsPageResult {
  delivery: DeliveryDetailResponse | null;
  loading: boolean;
  error: string | null;
  addOrder: () => Promise<void>;
  updateOrder: (
    orderCode: string,
    payload: UpdateOrderRequest,
  ) => Promise<void>;
  updateOrderStatus: (
    orderCode: string,
    status: OrderDeliveryStatus,
  ) => Promise<void>;
  linkStandbyOrder: (orderCode: string) => Promise<void>;
  updateDeliveryman: (payload: UpdateDeliverymanRequest) => Promise<void>;
  savingOrder: string | null;
  savingDeliveryman: boolean;
}

export interface UpdateDeliverymanRequest {
  name: string | null
  phoneNumber: string | null
}

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

export interface DriverOrderDetail {
  orderCode: string
  clientName: string | null
  clientPhone: string | null
  address: AddressDetail | null
  deliveryStatus: OrderDeliveryStatus
  notes: string | null
  totalAmount: number | null
  paymentMethod: PaymentMethod | null
}

export interface DriverDeliveryResponse {
  deliveryId: string
  publicCodeDeliveryman: string
  status: DeliveryStatus
  orders: DriverOrderDetail[]
}