import { useState } from "react";
import { Pause, Trash2 } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Input, TextArea } from "@/components/ui/Input";
import { ConfirmDeleteModal } from "./Confirmdeletemodal";
import { AddressForm } from "@/components/ui/form/AddressForm";
import { PaymentMethodSelector } from "@/components/ui/form/PaymentMethodSelect";
import type {
  OrderDetail,
  UpdateOrderRequest,
  PaymentMethod,
  AddressDetail,
  OrderDeliveryStatus,
} from "@/types";
import styles from "./Orderdetailcard.module.css";

const DELIVERY_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  WAITING:    { label: "Aguardando", color: "var(--yellow)"     },
  ON_THE_WAY: { label: "A caminho",  color: "var(--blue)"       },
  ARRIVING:   { label: "Chegando",   color: "var(--orange)"     },
  DELIVERED:  { label: "Entregue",   color: "var(--green)"      },
  CANCELLED:  { label: "Cancelado",  color: "var(--red)"        },
  STANDBY:    { label: "Standby",    color: "var(--text-muted)" },
  DELETED:    { label: "Deletado",   color: "var(--red)"        },
};

const ADDRESS_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ADDRESS_PENDING:   { label: "End. pendente",   color: "var(--orange)" },
  ADDRESS_CONFIRMED: { label: "End. confirmado", color: "var(--green)"  },
};

const FALLBACK_STATUS = { label: "Desconhecido", color: "var(--text-muted)" };

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const EMPTY_ADDRESS: AddressDetail = {
  street: "", number: "", complement: "",
  neighborhood: "", city: "", state: "", zipCode: "", country: "Brasil",
};

interface Props {
  order: OrderDetail;
  publicCodeClient: string;
  saving: boolean;
  onSave: (payload: UpdateOrderRequest) => Promise<void>;
  onStatusChange: (status: OrderDeliveryStatus) => Promise<void>;
  disableActions?: boolean;
}

export function OrderDetailCard({
  order,
  publicCodeClient,
  saving,
  onSave,
  onStatusChange,
  disableActions,
}: Props) {
  const [open, setOpen]                   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes]                 = useState(order.notes ?? "");
  const [totalAmount, setTotalAmount]     = useState(
    order.totalAmount != null ? String(order.totalAmount) : ""
  );
  const [paymentMethod, setPaymentMethod]           = useState<PaymentMethod | null>(order.paymentMethod ?? null);
  const [savedPaymentMethod, setSavedPaymentMethod] = useState<PaymentMethod | null>(order.paymentMethod ?? null);
  const [address, setAddress]     = useState<AddressDetail>(order.address ?? EMPTY_ADDRESS);
  const [clientName, setClientName]   = useState(order.clientName || "");
  const [clientPhone, setClientPhone] = useState(order.clientPhone || "");
  const [addressError, setAddressError] = useState<string | null>(null);

  const clientLink = `${window.location.origin}/track/${publicCodeClient}/${order.code}`;
  const copy = (text: string) => navigator.clipboard.writeText(text);

  const handleSave = async () => {
    const hasAnyAddressField = Object.entries(address).some(
      ([key, val]) => key !== "country" && val.trim() !== ""
    );
    if (hasAnyAddressField) {
      if (!address.street.trim() && !address.number.trim()) {
        setAddressError("Informe a rua e o número"); return;
      }
      if (!address.street.trim()) { setAddressError("Informe o nome da rua"); return; }
      if (!address.number.trim()) { setAddressError("Informe o número");      return; }
    }
    setAddressError(null);

    await onSave({
      clientName:    clientName || null,
      clientPhone:   clientPhone || null,
      notes:         notes || null,
      totalAmount:   totalAmount ? parseFloat(totalAmount) : null,
      paymentMethod,
      address:       address.street ? address : null,
    });

    setSavedPaymentMethod(paymentMethod);
    setOpen(false);
  };

  const deliveryStatus = DELIVERY_STATUS_CONFIG[order.deliveryStatus] ?? FALLBACK_STATUS;
  const addressStatus  = ADDRESS_STATUS_CONFIG[order.addressStatus]   ?? FALLBACK_STATUS;
  const savedAmount    = order.totalAmount != null ? formatCurrency(order.totalAmount) : null;

  return (
    <div className={styles.card} data-open={open}>

      {/* ── Header ── */}
      <div className={styles.header} onClick={() => setOpen(v => !v)}>
        <div className={styles.headerLeft}>
          <span className={styles.code}>#{order.code}</span>
          <span className={styles.clientName}>
            {order.clientName || "Cliente não informado"}
          </span>
        </div>
        <div className={styles.headerRight}>
          {savedAmount && <span className={styles.savedAmount}>{savedAmount}</span>}
          <span className={styles.statusPill} style={{ color: deliveryStatus.color, borderColor: deliveryStatus.color }}>
            <span className={styles.statusDot} style={{
              background: deliveryStatus.color,
              animation: order.deliveryStatus === "WAITING" ? "pulse 1.4s ease-in-out infinite" : "none",
            }} />
            {deliveryStatus.label}
          </span>
          <span className={styles.statusPill} style={{ color: addressStatus.color, borderColor: addressStatus.color }}>
            <span className={styles.statusDot} style={{
              background: addressStatus.color,
              animation: order.addressStatus === "ADDRESS_PENDING" ? "pulse 1.4s ease-in-out infinite" : "none",
            }} />
            {addressStatus.label}
          </span>
          <span className={styles.chevron}>{open ? "▴" : "▾"}</span>
        </div>
      </div>

      {/* ── Ações rápidas ── */}
      <div className={styles.actionBar} style={{ display: disableActions ? "flex" : "none" }}>
        <button
          className={styles.btnIconStandby}
          onClick={e => { e.stopPropagation(); onStatusChange("STANDBY"); }}
          title="Colocar em standby"
        >
          <Pause size={14} />
        </button>
        <button
          className={styles.btnIconDelete}
          onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
          title="Deletar pedido"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* ── Modal de confirmação ── */}
      {confirmDelete && (
        <ConfirmDeleteModal
          orderCode={order.code}
          onConfirm={async () => { setConfirmDelete(false); await onStatusChange("DELETED"); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* ── Corpo expandido ── */}
      {open && (
        <div className={styles.body}>

          {/* Link do cliente */}
          <div className={styles.linkRow}>
            <div className={styles.linkInfo}>
              <span className={styles.linkLabel}>Link do cliente</span>
              <span className={styles.linkValue}>{clientLink}</span>
            </div>
            <button className={styles.btnCopy} onClick={() => copy(clientLink)}>Copiar</button>
          </div>

          {/* Cliente */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              Cliente <span className={styles.optional}>opcional</span>
            </span>
            <div className={styles.clientRow}>
              <Field label="Nome">
                <Input placeholder="Ex: João Silva" value={clientName}
                  onChange={e => setClientName(e.target.value)} />
              </Field>
              <Field label="Telefone">
                <Input placeholder="(11) 99999-9999" value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)} />
              </Field>
            </div>
          </div>

          {/* ── Endereço — componente extraído ── */}
          <AddressForm
            address={address}
            onChange={setAddress}
            addressError={addressError}
            onClearError={() => setAddressError(null)}
          />

          {/* Pagamento */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              Pagamento <span className={styles.optional}>opcional</span>
            </span>
            <Field label="Valor total (R$)">
              <Input
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
              />
            </Field>

            {/* ── Métodos de pagamento — componente extraído ── */}
            <PaymentMethodSelector
              value={paymentMethod}
              savedValue={savedPaymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          {/* Observações */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              Observações <span className={styles.optional}>opcional</span>
            </span>
            <TextArea
              placeholder="Ex: Sem cebola, apartamento..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className={styles.footer}>
            <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
              {saving ? <><span className={styles.spinner} /> Salvando...</> : "Salvar pedido"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}