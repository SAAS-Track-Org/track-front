import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Navigation, Package } from "lucide-react";
import { useDriverDelivery } from "@/hooks/useDelivery";
import type { DriverOrderDetail } from "@/types";
import styles from "./Driverpage.module.css";
import googleMapsLogo from "@/img/google-maps-logo.png";
import wazeLogo from "@/img/waze-logo.png";

const DELIVERY_STATUS_CONFIG: Record<string, { label: string; color: string }> =
  {
    WAITING: { label: "Aguardando", color: "var(--yellow)" },
    ON_THE_WAY: { label: "A caminho", color: "var(--blue)" },
    ARRIVING: { label: "Chegando", color: "var(--orange)" },
    DELIVERED: { label: "Entregue", color: "var(--green)" },
    CANCELLED: { label: "Cancelado", color: "var(--red)" },
  };

const FALLBACK_STATUS = { label: "Desconhecido", color: "var(--text-muted)" };

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  CREDIT_CARD: "Crédito",
  DEBIT_CARD: "Débito",
  MEAL_VOUCHER: "Vale refeição",
  FOOD_VOUCHER: "Vale alimentação",
};

const buildAddressQuery = (address: DriverOrderDetail["address"]) => {
  if (!address) return "";
  return encodeURIComponent(
    `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city} - ${address.state}`,
  );
};

interface ConfirmModalProps {
  orderCode: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDeliverModal({
  orderCode,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIcon}>
          <CheckCircle size={22} />
        </div>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>Confirmar entrega</h3>
          <p className={styles.modalDesc}>
            Confirmar entrega do pedido{" "}
            <span className={styles.modalCode}>#{orderCode}</span>?
          </p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalBtnCancel} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.modalBtnConfirm} onClick={onConfirm}>
            Sim, entreguei
          </button>
        </div>
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: DriverOrderDetail;
  delivering: boolean;
  onDeliver: () => void;
}

function DriverOrderCard({ order, delivering, onDeliver }: OrderCardProps) {
  const [open, setOpen] = useState(false);
  const statusConfig =
    DELIVERY_STATUS_CONFIG[order.deliveryStatus] ?? FALLBACK_STATUS;
  const isDelivered = order.deliveryStatus === "DELIVERED";
  const isArriving = order.deliveryStatus === "ARRIVING";
  const addressQuery = buildAddressQuery(order.address);

  return (
    <div className={styles.orderCard} data-status={order.deliveryStatus}>
      {isArriving && <div className={styles.arrivingBar} />}

      <div className={styles.orderHeader} onClick={() => setOpen((v) => !v)}>
        <div className={styles.orderHeaderLeft}>
          <span className={styles.orderCode}>#{order.orderCode}</span>
          <span className={styles.orderClient}>
            {order.clientName || "Cliente não informado"}
          </span>
        </div>
        <div className={styles.orderHeaderRight}>
          {order.totalAmount != null && (
            <span className={styles.orderAmount}>
              {formatCurrency(order.totalAmount)}
            </span>
          )}
          <span
            className={styles.statusPill}
            style={{
              color: statusConfig.color,
              borderColor: statusConfig.color,
            }}
          >
            <span
              className={styles.statusDot}
              style={{
                background: statusConfig.color,
                animation: isArriving
                  ? "pulse 1.4s ease-in-out infinite"
                  : "none",
              }}
            />
            {statusConfig.label}
          </span>
          <span className={styles.chevron}>{open ? "▴" : "▾"}</span>
        </div>
      </div>

      {open && (
        <div className={styles.orderBody}>
          {/* Endereço */}
          {order.address && (
            <div className={styles.orderSection}>
              <span className={styles.orderSectionLabel}>Telefone</span>
              <p className={styles.addressText}>
                {order.clientPhone || "Telefone não informado"}
              </p>
              <span className={styles.orderSectionLabel}>Endereço</span>
              <p className={styles.addressText}>
                {order.address.street}, {order.address.number}
                {order.address.complement
                  ? ` — ${order.address.complement}`
                  : ""}
              </p>
              <p className={styles.addressSub}>
                {order.address.neighborhood} · {order.address.city}/
                {order.address.state}
              </p>
              {order.address.zipCode && (
                <p className={styles.addressSub}>CEP {order.address.zipCode}</p>
              )}
              <div className={styles.navLinks}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnNav}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={googleMapsLogo}
                    alt="Google Maps"
                    className={styles.navIcon}
                  />
                </a>
                <a
                  href={`https://waze.com/ul?q=${addressQuery}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnNav}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={wazeLogo} alt="Waze" className={styles.navIcon} />
                </a>
              </div>
            </div>
          )}

          {/* Pagamento */}
          {(order.paymentMethod || order.totalAmount != null) && (
            <div className={styles.orderSection}>
              <span className={styles.orderSectionLabel}>Pagamento</span>
              <div className={styles.paymentRow}>
                {order.paymentMethod && (
                  <span className={styles.paymentMethod}>
                    {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                )}
                {order.totalAmount != null && (
                  <span className={styles.paymentAmount}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Observações */}
          {order.notes && (
            <div className={styles.orderSection}>
              <span className={styles.orderSectionLabel}>Observações</span>
              <p className={styles.notesText}>{order.notes}</p>
            </div>
          )}

          {/* Botão entregar */}
          {!isDelivered && (
            <div className={styles.orderFooter}>
              <button
                className={styles.btnDeliver}
                onClick={onDeliver}
                disabled={delivering || !isArriving}
              >
                {delivering ? (
                  <>
                    <span className={styles.spinner} /> Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} /> Entreguei
                  </>
                )}
              </button>
            </div>
          )}

          {isDelivered && (
            <div className={styles.deliveredBadge}>
              <CheckCircle size={14} /> Entregue com sucesso
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DriverPage() {
  const { publicCodeDeliveryman } = useParams<{
    publicCodeDeliveryman: string;
  }>();
  const {
    delivery,
    loading,
    error,
    starting,
    deliveringOrder,
    startDelivery,
    deliverOrder,
  } = useDriverDelivery(publicCodeDeliveryman!);

  const [confirmOrder, setConfirmOrder] = useState<string | null>(null);
  const [confirmStart, setConfirmStart] = useState(false);

  const [startLocation, setStartLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleStart = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setStartLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
    startDelivery();
    setConfirmStart(false)
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.stateBox}>
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
          <div className={styles.stateBox} data-error>
            ⚠ {error ?? "Entrega não encontrada"}
          </div>
        </div>
      </div>
    );
  }

  const allAddressesConfirmed = delivery.orders.every(
    (o) => o.address !== null,
  );

  const activeOrders = delivery.orders.filter(
    (o) => o.deliveryStatus !== "DELIVERED" && o.deliveryStatus !== "CANCELLED",
  );
  const deliveredCount = delivery.orders.filter(
    (o) => o.deliveryStatus === "DELIVERED",
  ).length;
  const hasStarted = delivery.orders.some(
    (o) => o.deliveryStatus !== "WAITING",
  );
  const allDone = activeOrders.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerBrand}>
            <Package size={20} />
            <span className={styles.brandName}>MotoTrack</span>
          </div>
          <div className={styles.headerStats}>
            <span className={styles.statItem}>
              {deliveredCount}/{delivery.orders.length} entregas
            </span>
          </div>
        </div>

        {/* ── Status da rota ── */}
        <div className={styles.routeCard}>
          <div className={styles.routeInfo}>
            <span className={styles.routeLabel}>
              {allDone ? "✅ Entregas Finalizadas": allAddressesConfirmed ? hasStarted ? "🛵 Entrega em andamento" : "📋 Pronto para iniciar" : "⚠ Endereços pendentes"}
            </span>
            <span className={styles.routeSub}>
              {allDone
                ? "Parabéns, boa entrega!"
                : `${activeOrders.length} pedido${activeOrders.length !== 1 ? "s" : ""} restante${activeOrders.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {!hasStarted && !allDone && (
            <button
              className={`${styles.btnStart} ${allAddressesConfirmed ? styles.pulsBtnStart : ""}`}
              onClick={() =>
                !allAddressesConfirmed ? setConfirmStart(true) : handleStart()
              }
              disabled={starting}
            >
              {starting ? (
                <>
                  <span className={styles.spinner} /> Iniciando...
                </>
              ) : (
                <>
                  <Navigation size={15} /> Iniciar entrega
                </>
              )}
            </button>
          )}

          {allDone && startLocation && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${startLocation.lat},${startLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btnStart} ${styles.pulsBtnStart}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Navigation size={15} /> Retornar ao Início
            </a>
          )}
        </div>

        {/* ── Lista de pedidos ── */}
        <div className={styles.ordersList}>
          {delivery.orders.map((order) => (
            <DriverOrderCard
              key={order.orderCode}
              order={order}
              delivering={deliveringOrder === order.orderCode}
              onDeliver={() => setConfirmOrder(order.orderCode)}
            />
          ))}
        </div>
      </div>

      {/* ── Modal de confirmação ── */}
      {confirmOrder && (
        <ConfirmDeliverModal
          orderCode={confirmOrder}
          onConfirm={async () => {
            await deliverOrder(confirmOrder);
            setConfirmOrder(null);
          }}
          onCancel={() => setConfirmOrder(null)}
        />
      )}

      {/* ── Modal endereços pendentes ── */}
      {confirmStart && (
        <div className={styles.overlay} onClick={() => setConfirmStart(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div
              className={styles.modalIcon}
              style={{ borderColor: "var(--yellow)", color: "var(--yellow)" }}
            >
              ⚠
            </div>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>Endereços pendentes</h3>
              <p className={styles.modalDesc}>
                Nem todos os endereços foram confirmados pelos clientes. Deseja
                iniciar mesmo assim?
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalBtnCancel}
                onClick={() => setConfirmStart(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.modalBtnConfirm}
                style={{ background: "var(--yellow)", color: "#000" }}
                onClick={handleStart}
              >
                Iniciar mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
