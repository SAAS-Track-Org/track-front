import type { Address } from "@/types/types";
import type { PaymentMethod } from "@/types/enum.types";

export interface SaveClientDataRequest {
  clientName:  string | null;
  clientPhone: string | null;
  address:     Address;
  paymentMethod: PaymentMethod | null;
}