import type { Address } from "@/types/types";
import type { PaymentMethod, DeliveryStatus } from "@/types/enum.types"

export interface TrackOrderResponse {
  orderCode: string;
  clientName: string | null;
  clientPhone: string | null;
  deliveryStatus: string;
  addressStatus: "ADDRESS_PENDING" | "ADDRESS_CONFIRMED";
  address: Address | null;
  paymentMethod: PaymentMethod | null;
  availablePaymentMethods: PaymentMethod[];
  totalAmount: number | null;
  notes: string | null;
  delivery: {
    deliveryId: string;
    publicCodeClient: string;
    status: DeliveryStatus;
    currentLat: number | null;
    currentLng: number | null;
  };
}