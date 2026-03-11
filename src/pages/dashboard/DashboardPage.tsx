import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverDelivery } from "@/hooks/useDriverDelivery";
import { useProfile } from "@/hooks/useProfile";
import { DeliveryCard } from "../driver/components/DeliveryCard";
import { PaymentMethodSelector } from "@/components/ui/form/PaymentMethodSelect";
import styles from "./DashboardPage.module.css";

// ── Settings Modal ────────────────────────────────────────────────────────────

interface SettingsModalProps {
  onClose: () => void;
}

function SettingsModal({ onClose }: SettingsModalProps) {
  const {
    paymentMethods, setPaymentMethods,
    establishmentName, setEstablishmentName,
    address, setAddress,
    loading, saving, saved, error,
    save,
  } = useProfile();

  const isValid = paymentMethods.length > 0;

  async function handleSave() {
    if (!isValid) return;
    await save();
    if (!error) setTimeout(onClose, 800);
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Configurações</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
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
                <label className={styles.settingsLabel} htmlFor="establishmentName">
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
            {saved ? "✓ Salvo!" : saving ? "Salvando..." : "Salvar"}
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
}

function OptionsMenu({ onSettings, onLogout }: MenuProps) {
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
      </button>

      {open && (
        <div className={styles.menuDropdown}>
          <button
            className={styles.menuItem}
            onClick={() => { setOpen(false); onSettings(); }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Configurações
          </button>
          <div className={styles.menuDivider} />
          <button
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={() => { setOpen(false); onLogout(); }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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
            >
              + Nova entrega
            </button>
            <OptionsMenu
              onSettings={() => setShowSettings(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>

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
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}