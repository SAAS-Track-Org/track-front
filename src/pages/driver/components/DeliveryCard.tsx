import { useNavigate } from 'react-router-dom'
import type { DeliverySummary, DeliveryStatus, OrderStatus } from '@/types/types'
import styles from './DeliveryCard.module.css'

const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  CREATED:    'Criada',
  IN_TRANSIT: 'Em trânsito',
  DELIVERED:  'Entregue',
  CANCELLED:  'Cancelada',
}

const DELIVERY_STATUS_COLOR: Record<DeliveryStatus, string> = {
  CREATED:    'var(--yellow)',
  IN_TRANSIT: 'var(--blue)',
  DELIVERED:  'var(--green)',
  CANCELLED:  'var(--red)',
}

const ORDER_STATUS_TOOLTIP: Record<OrderStatus, string> = {
  ADDRESS_PENDING:   'Endereço pendente',
  ADDRESS_CONFIRMED: 'Endereço confirmado',
}

const ORDER_STATUS_DOT_COLOR: Record<OrderStatus, string> = {
  ADDRESS_PENDING:   'var(--orange)',
  ADDRESS_CONFIRMED: 'var(--green)',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

interface Props {
  delivery: DeliverySummary
}

export function DeliveryCard({ delivery }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/dashboard/delivery/${delivery.deliveryId}`)}
    >
      {/* ── Cabeçalho ── */}
      <div className={styles.header}>
        <div className={styles.left}>
          <div className={styles.nameRow}>
            <span className={styles.deliverymanIcon}>🛵</span>
            <span className={styles.deliverymanName}>{delivery.deliverymanName || 'Não informado'}</span>
          </div>
         
        </div>

        <div className={styles.right}>
          <span
            className={styles.deliveryStatus}
            style={{ color: DELIVERY_STATUS_COLOR[delivery.status] }}
          >
            <span
              className={styles.statusDot}
              style={{ background: DELIVERY_STATUS_COLOR[delivery.status] }}
            />
            {DELIVERY_STATUS_LABEL[delivery.status]}
          </span>
        </div>
      </div>

      {/* ── Corpo ── */}
      <div className={styles.body}>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Criada em</span>
            <span className={styles.metaValue}>{formatDate(delivery.createdAt)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Pedidos</span>
            <span className={styles.metaValue}>
              {delivery.orders.length} pedido{delivery.orders.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className={styles.orderCodes}>
          <span className={styles.orderCodesLabel}>Status dos pedidos</span>
          <div className={styles.codeList}>
            {delivery.orders.map(order => {
              const isPending = order.stausAddress === 'ADDRESS_PENDING'
              return (
                <div
                  key={order.code}
                  className={styles.orderItem}
                  title={`#${order.code} — ${ORDER_STATUS_TOOLTIP[order.stausAddress]}`}
                >
                  <span
                    className={`${styles.orderDot} ${isPending ? styles.orderDotPending : ''}`}
                    style={{ background: ORDER_STATUS_DOT_COLOR[order.stausAddress] }}
                  />
                  <span className={styles.codeBadge}>#{order.code}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}