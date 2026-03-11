import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrackOrder } from "@/hooks/useTrackOrder";
import { AddressForm } from "@/components/ui/form/AddressForm";
import { PaymentMethodSelector } from "@/components/ui/form/PaymentMethodSelect";
import { PAYMENT_METHODS } from "@/components/ui/form/Paymentmethods";
import { EMPTY_ADDRESS } from "@/components/ui/form/AddressForm";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { Address } from "@/types/types";
import type { PaymentMethod } from "@/types/enum.types";
import styles from "./Trackpage.module.css";

const ORDER_DELIVERY_STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  WAITING:    { label: "Aguardando", color: "var(--yellow)" },
  ON_THE_WAY: { label: "A caminho",  color: "var(--blue)"   },
  ARRIVING:   { label: "Chegando",   color: "var(--orange)" },
  DELIVERED:  { label: "Entregue",   color: "var(--green)"  },
  CANCELLED:  { label: "Cancelado",  color: "var(--red)"    },
};

function getPaymentLabel(method: PaymentMethod | null): string {
  if (!method) return "—";
  return PAYMENT_METHODS.find((m) => m.id === method)?.label ?? method;
}

export function TrackPage() {
  const { publicCodeClient, orderCode } = useParams<{
    publicCodeClient: string;
    orderCode: string;
  }>();

  const navigate = useNavigate();
  const { order, loading, error, saving, saveClientData } = useTrackOrder(
    publicCodeClient!,
    orderCode!,
  );

  const [editing, setEditing]             = useState(false);
  const [clientName, setClientName]       = useState("");
  const [clientPhone, setClientPhone]     = useState("");
  const [address, setAddress]             = useState<Address>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [addressError, setAddressError]   = useState<string | null>(null);

  const isConfirmed = order?.addressStatus === "ADDRESS_CONFIRMED";
  const isArriving  = order?.deliveryStatus === "ARRIVING";
  const canEdit =
    order?.deliveryStatus !== "ARRIVING" &&
    order?.deliveryStatus !== "ON_THE_WAY" &&
    order?.deliveryStatus !== "DELIVERED";

  function startEdit() {
    if (order?.clientName)    setClientName(order.clientName);
    if (order?.clientPhone)   setClientPhone(order.clientPhone);
    if (order?.address)       setAddress(order.address);
    if (order?.paymentMethod) setPaymentMethod(order.paymentMethod);
    setEditing(true);
  }

  function validateAddress(): boolean {
    if (!address.street.trim() && !address.number.trim()) {
      setAddressError("Informe a rua e o número"); return false;
    }
    if (!address.street.trim()) { setAddressError("Informe o nome da rua"); return false; }
    if (!address.number.trim()) { setAddressError("Informe o número");      return false; }
    return true;
  }

  async function handleSave() {
    if (!validateAddress()) return;
    setAddressError(null);
    await saveClientData({
      clientName:  clientName  || null,
      clientPhone: clientPhone || null,
      address,
      paymentMethod,
    });
    setEditing(false);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <span className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Carregando pedido...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <span className={styles.errorIcon}>⚠</span>
          <p className={styles.errorText}>{error ?? "Pedido não encontrado"}</p>
        </div>
      </div>
    );
  }

  const statusCfg = ORDER_DELIVERY_STATUS_CONFIG[order.deliveryStatus] ?? {
    label: order.deliveryStatus,
    color: "var(--text-muted)",
  };

  const availableMethods = order.availablePaymentMethods ?? [];

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🛵</span>
          <span className={styles.logoText}>MotoTrack</span>
        </div>
        <span className={styles.orderCode}>#{orderCode}</span>
      </header>

      <main className={styles.main}>
        {/* ── Status card ── */}
        <div className={styles.statusCard}>
          <div className={styles.statusRow}>
            <div className={styles.statusInfo}>
              <span className={styles.statusLabel}>Status do pedido</span>
              <span className={styles.statusValue} style={{ color: statusCfg.color }}>
                {statusCfg.label}
              </span>
            </div>
          </div>

          {isArriving && (
            <button
              className={styles.btnNavigate}
              onClick={() => navigate(`/navegacao/track/${publicCodeClient}/${orderCode}`)}
            >
              📍 Ver em tempo real
            </button>
          )}
        </div>

        {/* ── Dados confirmados (view) ── */}
        {isConfirmed && !editing && order.address && (
          <div className={styles.confirmedCard}>
            <div className={styles.confirmedTop}>
              <span className={styles.confirmedBadge}>✓ Endereço confirmado</span>
              {canEdit && (
                <button className={styles.btnEdit} onClick={startEdit}>Editar</button>
              )}
            </div>

            {order.clientName && (
              <p className={styles.confirmedName}>{order.clientName}</p>
            )}
            {order.clientPhone && (
              <p className={styles.confirmedPhone}>{order.clientPhone}</p>
            )}

            <p className={styles.confirmedAddress}>
              {order.address.street}, {order.address.number}
              {order.address.complement ? ` — ${order.address.complement}` : ""}
            </p>
            {(order.address.neighborhood || order.address.city) && (
              <p className={styles.confirmedAddressSub}>
                {order.address.neighborhood && `${order.address.neighborhood}, `}
                {order.address.city}
                {order.address.state ? ` — ${order.address.state}` : ""}
              </p>
            )}

            {order.paymentMethod && (
              <div className={styles.paymentSaved}>
                <span className={styles.paymentSavedLabel}>Pagamento</span>
                <span className={styles.paymentSavedValue}>
                  {getPaymentLabel(order.paymentMethod)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Formulário ── */}
        {(!isConfirmed || editing) && (
          <div className={styles.formCard}>
            <p className={styles.formIntro}>
              {isConfirmed
                ? "Atualize seus dados abaixo."
                : "Informe seus dados para que o entregador possa te encontrar."}
            </p>

            {/* Dados do cliente */}
            <div className={styles.clientSection}>
              <Field label="Seu nome">
                <Input
                  placeholder="Ex: João Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </Field>
              <Field label="Telefone">
                <Input
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </Field>
            </div>

            <AddressForm
              address={address}
              onChange={setAddress}
              addressError={addressError}
              onClearError={() => setAddressError(null)}
            />

            {availableMethods.length > 0 && (
              <div className={styles.paymentSection}>
                <span className={styles.sectionLabel}>
                  Pagamento <span className={styles.optional}>opcional</span>
                </span>
                <PaymentMethodSelector
                  value={paymentMethod}
                  savedValue={order.paymentMethod}
                  onChange={setPaymentMethod}
                  availableMethods={availableMethods}
                />
              </div>
            )}

            <div className={styles.formActions}>
              {editing && (
                <button
                  className={styles.btnCancel}
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              )}
              <button
                className={styles.btnSave}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <><span className={styles.spinner} /> Salvando...</>
                ) : isConfirmed ? (
                  "Atualizar dados"
                ) : (
                  "Confirmar endereço"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}