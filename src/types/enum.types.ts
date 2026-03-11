export type DeliveryStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export type OrderDeliveryStatus =
  | "WAITING"
  | "ON_THE_WAY"
  | "ARRIVING"
  | "DELIVERED"
  | "CANCELLED"
  | "DELETED"
  | "STANDBY";

export type PaymentMethod =
  | "CASH"
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MEAL_VOUCHER"
  | "FOOD_VOUCHER";

export type OrderStatus = "ADDRESS_PENDING" | "ADDRESS_CONFIRMED";
