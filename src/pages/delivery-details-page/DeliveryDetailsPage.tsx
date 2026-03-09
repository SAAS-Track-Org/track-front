import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeliveryDetails } from "@/hooks/useDeliveryDetails";
import { OrderDetailCard } from "./components/Orderdetailcard";
import { StandbyOrderSelect } from "./components/Standbyorderselect";

import { Input } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import styles from "./DeliveryDetailsPage.module.css";
import { DeliveryStatus } from "@/types";

const copyLink = (text: string) => navigator.clipboard.writeText(text);

export function DeliveryDetailsPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const navigate = useNavigate();
  const {
    delivery,
    loading,
    error,
    addOrder,
    updateOrder,
    updateOrderStatus,
    linkStandbyOrder,
    updateDeliveryman,
    savingOrder,
    savingDeliveryman,
  } = useDeliveryDetails(deliveryId!);

  const DELIVERY_STATUS_CONFIG: Record<
    DeliveryStatus,
    { label: string; className: string }
  > = {
    CREATED: { label: "Criado", className: styles.statusCreated },
    IN_TRANSIT: { label: "Em trânsito", className: styles.statusInTransit },
    DELIVERED: { label: "Entregue", className: styles.statusDelivered },
    CANCELLED: { label: "Cancelado", className: styles.statusCancelled },
  };

  // ── Estado local do entregador ──
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverInitialized, setDriverInitialized] = useState(false);

  // Inicializa os campos com os dados da API uma vez
  if (delivery && !driverInitialized) {
    setDriverName(delivery.deliverymanName ?? "");
    setDriverPhone(delivery.deliverymanPhone ?? "");
    setDriverInitialized(true);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <span className={styles.spinner} /> Carregando entrega...
          </div>
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            ⚠ {error ?? "Entrega não encontrada"}
          </div>
          <button
            className={styles.btnBack}
            onClick={() => navigate("/dashboard")}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const driverLink = `${window.location.origin}/driver/${delivery.publicCodeDeliveryman}`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <button
            className={styles.btnBack}
            onClick={() => navigate("/dashboard")}
          >
            ← Voltar
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Detalhes da entrega</h1>
            <p className={styles.subtitle}>{delivery.deliverymanName}</p>
          </div>
        </div>

        {/* ── Card do entregador ── */}
        <div className={styles.driverCard}>
          <div className={styles.driverCardHeader}>
            <span className={styles.driverCardTitle}>🛵 Entregador</span>
            <span className={DELIVERY_STATUS_CONFIG[delivery.status].className}>
              {DELIVERY_STATUS_CONFIG[delivery.status].label}
            </span>
          </div>

          <div className={styles.driverLinkRow}>
            <span className={styles.linkLabel}>Link do entregador</span>
            <div className={styles.driverLinkValue}>
              <span className={styles.linkValue}>{driverLink}</span>
              <button
                className={styles.btnCopy}
                onClick={() => copyLink(driverLink)}
              >
                Copiar
              </button>
            </div>
          </div>

          <div className={styles.driverFields}>
            <Field label="Nome">
              <Input
                placeholder="Nome do entregador"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </Field>
            <Field label="Telefone">
              <Input
                placeholder="(11) 99999-9999"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
              />
            </Field>
          </div>

          <div className={styles.driverFooter}>
            <button
              className={styles.btnSaveDriver}
              onClick={() =>
                updateDeliveryman({
                  name: driverName || null,
                  phoneNumber: driverPhone || null,
                })
              }
              disabled={savingDeliveryman}
            >
              {savingDeliveryman ? (
                <>
                  <span className={styles.spinner} /> Salvando...
                </>
              ) : (
                "Salvar entregador"
              )}
            </button>
          </div>
        </div>

        {/* ── Pedidos ── */}
        <div className={styles.ordersSection}>
          <div className={styles.ordersHeader}>
            <span className={styles.ordersTitle}>
              Pedidos ({delivery.orders.length})
            </span>
            <div className={styles.ordersActions}>
              <StandbyOrderSelect
                disabled={delivery.status !== "CREATED"}
                onLink={(orderCode) => linkStandbyOrder(orderCode)}
              />
              <button
                className={styles.btnAddOrder}
                onClick={addOrder}
                disabled={delivery.status !== "CREATED"}
              >
                + Novo pedido
              </button>
            </div>
          </div>

          <div className={styles.ordersList}>
            {delivery.orders.map((order) => (
              <OrderDetailCard
                key={order.code}
                order={order}
                publicCodeClient={delivery.publicCodeClient}
                saving={savingOrder === order.code}
                onSave={(payload) => updateOrder(order.code, payload)}
                onStatusChange={(status) =>
                  updateOrderStatus(order.code, status)
                }
                disableActions={delivery.status == "CREATED"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
