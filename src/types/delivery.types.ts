import { UUID } from "node:crypto";
import {
  OrderDeliveryStatus,
  PaymentMethod,
  OrderStatus,
  DeliveryStatus,
} from "./enum.types";
import { AddressDetail } from "./types";

export interface OrderDetail {
  code: string;
  clientName: string | null;
  clientPhone: string | null;
  addressStatus: OrderStatus;
  deliveryStatus: OrderDeliveryStatus;
  notes: string | null;
  totalAmount: number | null;
  paymentMethod: PaymentMethod | null;
  address: AddressDetail | null;
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
  address: AddressDetail | null;
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
