import { PaymentMethod, OrderStatus } from "./enum.types";

export interface ClientForm {
  id: string | null;
  name: string;
  phoneNumber: string;
}

export interface DeliverymanForm {
  id: string | null;
  name: string;
  phoneNumber: string;
}

export interface OrderForm {
  id: string;
  client: ClientForm;
  notes: string;
  totalAmount?: string;
  paymentMethod?: PaymentMethod;
}

export interface CreateDeliveryForm {
  deliveryman: DeliverymanForm;
  orders: OrderForm[];
}

// ─── API Payload ──────────────────────────────────────────────────────────────

export interface CreateDeliveryPayload {
  deliveryman: {
    id: string | null;
    name: string;
    phoneNumber: string;
  };
  orders: {
    client: {
      id: string | null;
      name: string;
      phoneNumber: string;
    };
    notes: string;
  }[];
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderResponse {
  code: string;
  clientName: string;
  status: OrderStatus;
  address: Address | null;
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

export interface LocationUpdate {
  lat: number;
  lng: number;
}

// ─── API Response — Address ───────────────────────────────────────────────────

export interface ClientAddressSummary {
  id: string;
  zipCode: string;
  street: string;
}

// ─── API Response — Client ────────────────────────────────────────────────────

export interface ClientSearchResult {
  id: string;
  dataClient: string; // formato: "telefone — Nome"
  name: string;
  phoneNumber: string;
}
