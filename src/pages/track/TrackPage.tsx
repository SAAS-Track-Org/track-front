import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrackOrder } from '@/hooks/useTrackOrder'
import { AddressForm } from '@/components/ui/form/AddressForm'
import { PaymentMethodSelector , PAYMENT_METHODS} from '@/components/ui/form/PaymentMethodSelect'
import { EMPTY_ADDRESS } from '@/components/ui/form/AddressForm'
import type { AddressDetail, PaymentMethod } from '@/types'
import styles from './TrackPage.module.css'

const ORDER_DELIVERY_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  WAITING:    { label: 'Aguardando',  color: 'var(--yellow)',     icon: '⏳' },
  ON_THE_WAY: { label: 'A caminho',   color: 'var(--blue)',       icon: '🛵' },
  ARRIVING:   { label: 'Chegando',    color: 'var(--orange)',     icon: '📍' },
  DELIVERED:  { label: 'Entregue',    color: 'var(--green)',      icon: '✅' },
  CANCELLED:  { label: 'Cancelado',   color: 'var(--red)',        icon: '✕'  },
}

function getPaymentLabel(method: PaymentMethod | null): string {
  if (!method) return '—'
  return PAYMENT_METHODS.find(m => m.id === method)?.label ?? method
}

export function TrackPage() {
  const { publicCodeClient, orderCode } = useParams<{
    publicCodeClient: string
    orderCode: string
  }>()

  const navigate = useNavigate()
  const { order, loading, error, saving, saveClientData } = useTrackOrder(
    publicCodeClient!,
    orderCode!,
  )

  const [editing, setEditing]             = useState(false)
  const [address, setAddress]             = useState<AddressDetail>(EMPTY_ADDRESS)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [addressError, setAddressError]   = useState<string | null>(null)

  const isConfirmed = order?.addressStatus === 'ADDRESS_CONFIRMED'
  const isArriving  = order?.deliveryStatus === 'ARRIVING'
  const canEdit     = order?.deliveryStatus !== 'ARRIVING' && order?.deliveryStatus !== 'DELIVERED'

  function startEdit() {
    if (order?.address)       setAddress(order.address)
    if (order?.paymentMethod) setPaymentMethod(order.paymentMethod)
    setEditing(true)
  }

  function validateAddress(): boolean {
    if (!address.street.trim() && !address.number.trim()) {
      setAddressError('Informe a rua e o número'); return false
    }
    if (!address.street.trim()) { setAddressError('Informe o nome da rua'); return false }
    if (!address.number.trim()) { setAddressError('Informe o número');      return false }
    return true
  }

  async function handleSave() {
    if (!validateAddress()) return
    setAddressError(null)
    await saveClientData({ address, paymentMethod })
    setEditing(false)
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <span className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Carregando pedido...</span>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !order) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <span className={styles.errorIcon}>⚠</span>
          <p className={styles.errorText}>{error ?? 'Pedido não encontrado'}</p>
        </div>
      </div>
    )
  }

  const statusCfg = ORDER_DELIVERY_STATUS_CONFIG[order.deliveryStatus] ?? {
    label: order.deliveryStatus, color: 'var(--text-muted)', icon: '•',
  }

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
            <span className={styles.statusIcon}>{statusCfg.icon}</span>
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

        {/* ── Endereço confirmado (view) ── */}
        {isConfirmed && !editing && order.address && (
          <div className={styles.confirmedCard}>
            <div className={styles.confirmedTop}>
              <span className={styles.confirmedBadge}>✓ Endereço confirmado</span>
              {canEdit && (
                <button className={styles.btnEdit} onClick={startEdit}>
                  Editar
                </button>
              )}
            </div>

            <p className={styles.confirmedAddress}>
              {order.address.street}, {order.address.number}
              {order.address.complement ? ` — ${order.address.complement}` : ''}
            </p>
            {(order.address.neighborhood || order.address.city) && (
              <p className={styles.confirmedAddressSub}>
                {order.address.neighborhood && `${order.address.neighborhood}, `}
                {order.address.city}{order.address.state ? ` — ${order.address.state}` : ''}
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
                ? 'Atualize seu endereço de entrega abaixo.'
                : 'Informe seu endereço para que o entregador possa te encontrar.'}
            </p>

            <AddressForm
              address={address}
              onChange={setAddress}
              addressError={addressError}
              onClearError={() => setAddressError(null)}
            />

            <div className={styles.paymentSection}>
              <span className={styles.sectionLabel}>
                Pagamento <span className={styles.optional}>opcional</span>
              </span>
              <PaymentMethodSelector
                value={paymentMethod}
                savedValue={order.paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>

            <div className={styles.formActions}>
              {editing && (
                <button className={styles.btnCancel} onClick={() => setEditing(false)} disabled={saving}>
                  Cancelar
                </button>
              )}
              <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
                {saving
                  ? <><span className={styles.spinner} /> Salvando...</>
                  : isConfirmed ? 'Atualizar endereço' : 'Confirmar endereço'
                }
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}