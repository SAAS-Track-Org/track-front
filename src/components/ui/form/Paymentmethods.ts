import type { PaymentMethod } from "@/types/enum.types";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "CASH",         label: "Dinheiro",        icon: "💵" },
  { id: "PIX",          label: "Pix",             icon: "⚡" },
  { id: "CREDIT_CARD",  label: "Crédito",         icon: "💳" },
  { id: "DEBIT_CARD",   label: "Débito",          icon: "💳" },
  { id: "MEAL_VOUCHER", label: "Vale refeição",    icon: "🍽️" },
  { id: "FOOD_VOUCHER", label: "Vale alimentação", icon: "🛒" },
]

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH:         "Dinheiro",
  PIX:          "Pix",
  CREDIT_CARD:  "Crédito",
  DEBIT_CARD:   "Débito",
  MEAL_VOUCHER: "Vale refeição",
  FOOD_VOUCHER: "Vale alimentação",
}