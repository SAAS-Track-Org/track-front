import type { PaymentMethod } from "@/types";
import styles from "./Paymentmethodselector.module.css";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "CASH",         label: "Dinheiro",         icon: "💵" },
  { id: "PIX",          label: "Pix",              icon: "⚡" },
  { id: "CREDIT_CARD",  label: "Crédito",          icon: "💳" },
  { id: "DEBIT_CARD",   label: "Débito",           icon: "🏧" },
  { id: "MEAL_VOUCHER", label: "Vale refeição",     icon: "🍽️" },
  { id: "FOOD_VOUCHER", label: "Vale alimentação",  icon: "🛒" },
];

interface PaymentMethodSelectorProps {
  /** Método atualmente selecionado na UI */
  value: PaymentMethod | null;
  /** Método já salvo no servidor — controla badge "salvo" / "novo" */
  savedValue?: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  value,
  savedValue,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className={styles.paymentGrid}>
      {PAYMENT_METHODS.map((m) => {
        const isSelected = value     === m.id;
        const isSaved    = savedValue === m.id;
        const isChanging = isSelected && !isSaved;

        return (
          <button
            key={m.id}
            type="button"
            className={[
              styles.paymentBtn,
              isSelected             ? styles.paymentBtnActive : "",
              isSaved && !isSelected ? styles.paymentBtnSaved  : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(m.id)}
          >
            <span>{m.icon}</span>
            <span className={styles.paymentLabel}>{m.label}</span>

            {isSaved && !isChanging && (
              <span className={styles.paymentBadgeSaved}>salvo</span>
            )}
            {isChanging && (
              <span className={styles.paymentBadgeNew}>novo</span>
            )}
          </button>
        );
      })}
    </div>
  );
}