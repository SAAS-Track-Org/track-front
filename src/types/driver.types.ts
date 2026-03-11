import {
  OrderDeliveryStatus,
  AddressStatus,
  PaymentMethod,
  DeliveryStatus,
} from "./enum.types";

import { Address } from "./types";

export interface DriverOrderDetail {
  orderCode: string;
  clientName: string | null;
  clientPhone: string | null;
  address: Address | null;
  deliveryStatus: OrderDeliveryStatus;
  addressStatus: AddressStatus;
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