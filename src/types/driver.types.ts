import {
  OrderDeliveryStatus,
  PaymentMethod,
  DeliveryStatus,
} from "./enum.types";

import { AddressDetail } from "./types";

export interface DriverOrderDetail {
  orderCode: string;
  clientName: string | null;
  clientPhone: string | null;
  address: AddressDetail | null;
  deliveryStatus: OrderDeliveryStatus;
  notes: string | null;
  totalAmount: number | null;
  paymentMethod: PaymentMethod | null;
}

export interface DriverDeliveryResponse {
  deliveryId: string;
  publicCodeDeliveryman: string;
  status: DeliveryStatus;
  orders: DriverOrderDetail[];
}
