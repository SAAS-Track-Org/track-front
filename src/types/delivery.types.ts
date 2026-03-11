import { Address, OrderResponse } from "@/types/types";

import {
  OrderDeliveryStatus,
  PaymentMethod,
  AddressStatus,
  DeliveryStatus,
} from "./enum.types";

export interface OrderDetail {
  code: string;
  clientName: string | null;
  clientPhone: string | null;
  addressStatus: AddressStatus;
  deliveryStatus: OrderDeliveryStatus;
  notes: string | null;
  totalAmount: number | null;
  paymentMethod: PaymentMethod | null;
  address: Address | null;
}

export interface DeliveryDetailResponse {
  deliveryId: string;
  publicCodeClient: string;
  publicCodeDeliveryman: string;
  status: DeliveryStatus;
  deliverymanName: string;
  deliverymanPhone: string | null;
  createdAt: string;
  orders: OrderDetail[];
}

export interface UpdateOrderRequest {
  clientName: string | null;
  clientPhone: string | null;
  notes: string | null;
  totalAmount: number | null;
  paymentMethod: PaymentMethod | null;
  address: Address | null;
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

export interface StandbyOrderSummary {
  code: string;
  clientName: string | null;
  deliveryId: string;
  label: string;
}

export interface UpdateDeliverymanRequest {
  name: string | null;
  phoneNumber: string | null;
}

export interface CreateDeliveryResponse {
  deliveryId: string;
  publicCodeClient: string;
  publicCodeDeliveryman: string;
  status: DeliveryStatus;
  orders: {
    code: string;
    clientName: string;
    status: AddressStatus;
    address: Address | null;
  }[];
}

// ─── API Response — Dashboard List ───────────────────────────────────────────

export interface DeliveryOrderSummary {
  code: string;
  stausAddress: AddressStatus;
}

export interface DeliverySummary {
  deliveryId: string;
  status: DeliveryStatus;
  orders: DeliveryOrderSummary[];
  clientName: string;
  deliverymanName: string;
  createdAt: string;
}

export interface TrackDeliveryResponse {
  deliveryId: string;
  publicCodeClient: string;
  status: DeliveryStatus;
  currentLat: number | null;
  currentLng: number | null;
  orders: OrderResponse[];
}

export interface DeliverymanSearchResult {
  id: string;
  dataClient: string;
  name: string;
  phoneNumber: string;
}
