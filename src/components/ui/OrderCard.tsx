import styles from './OrderCard.module.css'

interface OrderCardProps {
  index: number
  label?: string
  total?: number
  onRemove?: () => void
  children: React.ReactNode
}

export function OrderCard({ index, label, total, onRemove, children }: OrderCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tag}>
          {label ?? `Pedido ${index + 1}`}
        </span>
        <div className={styles.headerRight}>
          {total !== undefined && (
            <span className={styles.total}>
              Total: R$ {total.toFixed(2)}
            </span>
          )}
          {onRemove && (
            <button className={styles.btnRemove} onClick={onRemove}>
              Remover
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

interface SectionLabelProps {
  children: React.ReactNode
}

export function SectionLabel({ children }: SectionLabelProps) {
  return <div className={styles.sectionLabel}>{children}</div>
}
