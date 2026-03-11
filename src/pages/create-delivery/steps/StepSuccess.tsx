import { useState } from "react";
import type { OrderStatus } from "@/types/enum.types";
import type {
  CreateDeliveryResponse,
  OrderDetail,
} from "@/types/delivery.types";
import styles from "./StepSuccess.module.css";

interface Props {
  response: CreateDeliveryResponse;
  onManage: () => void;
  onNew: () => void;
  onAddOrder: () => Promise<OrderDetail>;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  ADDRESS_CONFIRMED: "Endereço confirmado",
  ADDRESS_PENDING: "Endereço pendente",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  ADDRESS_PENDING: "var(--yellow)",
  ADDRESS_CONFIRMED: "var(--green)",
};

export function StepSuccess({ response, onManage, onNew, onAddOrder }: Props) {
  const [addingOrder, setAddingOrder] = useState(false);

  const handleAddOrder = async () => {
    setAddingOrder(true);
    try {
      await onAddOrder();
      // Recarrega a página de detalhe após adicionar — navega direto
      onManage();
    } finally {
      setAddingOrder(false);
    }
  };

  const origin = window.location.origin;
  const driverLink = `${origin}/driver/${response.publicCodeDeliveryman}`;
  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className={styles.wrapper}>
      {/* ── Check ── */}
      <div className={styles.checkCircle}>✓</div>
      <h2 className={styles.title}>Entrega criada!</h2>
      <p className={styles.desc}>
        Compartilhe o link abaixo com o entregador e adicione os pedidos
      </p>

      {/* ── Link do entregador ── */}
      <div className={styles.linkCard}>
        <span className={styles.linkLabel}>Link do entregador</span>
        <span className={styles.linkValue}>{driverLink}</span>
        <button className={styles.btnCopy} onClick={() => copy(driverLink)}>
          Copiar link do entregador
        </button>
      </div>

      {/* ── Pedido inicial criado ── */}
      {response.orders.length > 0 && (
        <div className={styles.ordersSection}>
          <span className={styles.sectionLabel}>Pedido inicial</span>
          {response.orders.map((order) => (
            <div key={order.code} className={styles.orderRow}>
              <span className={styles.orderCode}>{order.code}</span>
              <span
                className={styles.orderStatus}
                style={{ color: STATUS_COLOR[order.status] }}
              >
                {STATUS_LABEL[order.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Ações ── */}
      <div className={styles.actions}>
        <button
          className={styles.btnAddOrder}
          onClick={handleAddOrder}
          disabled={addingOrder}
        >
          {addingOrder ? (
            <>
              <span className={styles.spinner} /> Adicionando...
            </>
          ) : (
            "+ Novo pedido"
          )}
        </button>
        <button className={styles.btnManage} onClick={onManage}>
          Gerenciar entrega →
        </button>
        <button className={styles.btnNew} onClick={onNew}>
          Ver todas as entregas
        </button>
      </div>
    </div>
  );
}
