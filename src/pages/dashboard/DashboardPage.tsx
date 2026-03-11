import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverDelivery } from "@/hooks/useDriverDelivery";
import { useProfile } from "@/hooks/useProfile";
import { DeliveryCard } from "../driver/components/DeliveryCard";
import { PaymentMethodSelector } from "@/components/ui/form/PaymentMethodSelect";
import type { PaymentMethod } from "@/types/enum.types";
import styles from "./DashboardPage.module.css";

// ── Settings Modal ────────────────────────────────────────────────────────────

interface SettingsModalProps {
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (v: PaymentMethod[]) => void;
  establishmentName: string;
  setEstablishmentName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
  save: () => Promise<void>;
  onClose: () => void;
}

function SettingsModal({
  paymentMethods,
  setPaymentMethods,
  establishmentName,
  setEstablishmentName,
  address,
  setAddress,
  loading,
  saving,
  saved,
  error,
  save,
  onClose,
}: SettingsModalProps) {
  const isValid = paymentMethods.length > 0;

  async function handleSave() {
    if (!isValid) return;
    await save();
  }

  useEffect(() => {
    if (saved) {
      const t = setTimeout(onClose, 600);
      return () => clearTimeout(t);
    }
  }, [saved, onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Configurações</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}>
              <span className={styles.spinner} /> Carregando perfil...
            </div>
          ) : (
            <>
              <div className={styles.settingsGroup}>
                <label className={styles.settingsLabel}>
                  Formas de pagamento aceitas
                  <span className={styles.required}>*</span>
                </label>
                <p className={styles.settingsHint}>
                  Selecione todas as formas que você aceita
                </p>
                <PaymentMethodSelector
                  mode="multi"
                  value={paymentMethods}
                  onChange={setPaymentMethods}
                />
              </div>

              <div className={styles.settingsGroup}>
                <label
                  className={styles.settingsLabel}
                  htmlFor="establishmentName"
                >
                  Nome do estabelecimento
                  <span className={styles.optional}>opcional</span>
                </label>
                <input
                  id="establishmentName"
                  type="text"
                  className={styles.settingsInput}
                  placeholder="Ex: Pizzaria do João"
                  value={establishmentName}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                />
              </div>

              <div className={styles.settingsGroup}>
                <label className={styles.settingsLabel} htmlFor="address">
                  Endereço inicial
                  <span className={styles.optional}>opcional</span>
                </label>
                <input
                  id="address"
                  type="text"
                  className={styles.settingsInput}
                  placeholder="Ex: Rua das Flores, 123 — São Paulo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {error && <div className={styles.settingsError}>{error}</div>}
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.btnSave}
            onClick={handleSave}
            disabled={!isValid || saving || loading}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Menu 3 pontos ─────────────────────────────────────────────────────────────

interface MenuProps {
  onSettings: () => void;
  onLogout: () => void;
  hasWarning?: boolean;
}

function OptionsMenu({ onSettings, onLogout, hasWarning }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.menuWrapper} ref={ref}>
      <button
        className={styles.btnMenu}
        onClick={() => setOpen((v) => !v)}
        aria-label="Opções"
      >
        ···
        {hasWarning && <span className={styles.menuWarningDot} />}
      </button>

      {open && (
        <div className={styles.menuDropdown}>
          <button
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              onSettings();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="7"
                cy="7"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            Configurações
            {hasWarning && <span className={styles.menuItemBadge}>!</span>}
          </button>
          <div className={styles.menuDivider} />
          <button
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M12 7H5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const { deliveries, loading } = useDriverDelivery();
  const [showSettings, setShowSettings] = useState(false);

  // useProfile instanciado UMA VEZ — o modal recebe tudo via props
  const profile = useProfile();
  const missingPaymentMethods =
    !profile.loading && profile.committedPaymentMethods.length === 0;

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Entregas</h1>
            <p className={styles.subtitle}>
              Gerencie e acompanhe todas as entregas
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.btnNew}
              onClick={() => navigate("/dashboard/new")}
              disabled={missingPaymentMethods}
              title={
                missingPaymentMethods
                  ? "Configure as formas de pagamento primeiro"
                  : undefined
              }
            >
              + Nova entrega
            </button>
            <OptionsMenu
              onSettings={() => setShowSettings(true)}
              onLogout={handleLogout}
              hasWarning={missingPaymentMethods}
            />
          </div>
        </div>

        {/* ── Alerta de formas de pagamento ── */}
        {missingPaymentMethods && (
          <div className={styles.paymentWarning}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={styles.paymentWarningIcon}
            >
              <path
                d="M8 1.5L14.5 13H1.5L8 1.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M8 6v3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="8" cy="11.5" r="0.8" fill="currentColor" />
            </svg>
            <span>
              Configure as <strong>formas de pagamento</strong> antes de criar
              entregas.
            </span>
            <button
              className={styles.paymentWarningBtn}
              onClick={() => setShowSettings(true)}
            >
              Configurar agora
            </button>
          </div>
        )}

        {/* ── Estados ── */}
        {loading ? (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Carregando entregas...
          </div>
        ) : deliveries.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📦</span>
            <p>Nenhuma entrega criada ainda</p>
            <button
              className={styles.btnNewEmpty}
              onClick={() => navigate("/dashboard/new")}
              disabled={missingPaymentMethods}
            >
              Criar primeira entrega
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {deliveries.map((delivery) => (
              <DeliveryCard key={delivery.deliveryId} delivery={delivery} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de configurações ── */}
      {showSettings && (
        <SettingsModal {...profile} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
