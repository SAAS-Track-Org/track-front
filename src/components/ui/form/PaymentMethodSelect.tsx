import { PAYMENT_METHODS } from "./Paymentmethods"
import type { PaymentMethod } from "@/types";
import styles from "./Paymentmethodselector.module.css";

// ── Modo único (comportamento original) ──────────────────────────────────────
interface SingleProps {
  mode?: "single";
  value: PaymentMethod | null;
  savedValue?: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
}

// ── Modo múltiplo ─────────────────────────────────────────────────────────────
interface MultiProps {
  mode: "multi";
  value: PaymentMethod[];
  savedValue?: PaymentMethod[];
  onChange: (methods: PaymentMethod[]) => void;
}

type PaymentMethodSelectorProps = SingleProps | MultiProps;

export function PaymentMethodSelector(props: PaymentMethodSelectorProps) {
  const isMulti = props.mode === "multi";

  function handleClick(id: PaymentMethod) {
    if (isMulti) {
      const current = (props as MultiProps).value;
      const next = current.includes(id)
        ? current.filter((m) => m !== id)
        : [...current, id];
      (props as MultiProps).onChange(next);
    } else {
      (props as SingleProps).onChange(id);
    }
  }

  function getStates(id: PaymentMethod) {
    if (isMulti) {
      const { value, savedValue = [] } = props as MultiProps;
      const isSelected      = value.includes(id);
      const isSaved         = savedValue.includes(id);
      const isSelectedSaved = isSelected && isSaved;
      const isChanging      = isSelected && !isSaved;
      return { isSelected, isSaved, isSelectedSaved, isChanging };
    } else {
      const { value, savedValue } = props as SingleProps;
      const isSelected      = value      === id;
      const isSaved         = savedValue === id;
      const isSelectedSaved = isSelected && isSaved;
      const isChanging      = isSelected && !isSaved;
      return { isSelected, isSaved, isSelectedSaved, isChanging };
    }
  }

  return (
    <div className={styles.paymentGrid}>
      {PAYMENT_METHODS.map((m) => {
        const { isSelected, isSaved, isSelectedSaved, isChanging } = getStates(m.id);

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
            onClick={() => handleClick(m.id)}
          >
            <span>{m.icon}</span>
            <span className={styles.paymentLabel}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}