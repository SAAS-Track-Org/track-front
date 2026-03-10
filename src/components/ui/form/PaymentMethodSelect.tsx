import { PAYMENT_METHODS } from "./Paymentmethods"
import type { PaymentMethod } from "@/types";
import styles from "./Paymentmethodselector.module.css";

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
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
        const isSelected      = value      === m.id
        const isSaved         = savedValue === m.id
        const isSelectedSaved = isSelected && isSaved
        const isChanging      = isSelected && !isSaved

        return (
          <button
            key={m.id}
            type="button"
            className={[
              styles.paymentBtn,
              isSelected             ? styles.paymentBtnActive      : "",
              isSelectedSaved        ? styles.paymentBtnSavedActive : "",
              isChanging             ? styles.paymentBtnChanging    : "",
              isSaved && !isSelected ? styles.paymentBtnSaved       : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(m.id)}
          >
            <span>{m.icon}</span>
            <span className={styles.paymentLabel}>{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}