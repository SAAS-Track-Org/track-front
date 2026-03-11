import { useEffect, useRef, useState } from 'react'
import { deliveryService } from '@/services/api/delivery.service'
import type { StandbyOrderSummary } from '@/types/types'
import styles from './Standbyorderselect.module.css'

interface Props {
  onLink: (orderCode: string) => Promise<void>
  disabled: boolean
}
export function StandbyOrderSelect({ onLink, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [orders, setOrders] = useState<StandbyOrderSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    if (open) { setOpen(false); return }
    setOpen(true)
    setLoading(true)
    try {
      const data = await deliveryService.listStandbyOrders()
      setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async (orderCode: string) => {
    setLinking(orderCode)
    try {
      await onLink(orderCode)
      setOrders(prev => prev.filter(o => o.code !== orderCode))
      setOpen(false)
    } finally {
      setLinking(null)
    }
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={styles.btnTrigger}
        onClick={handleOpen}
        disabled={disabled}
      >
        ⏸Pedidos em Standby
      </button>

      {open && (
        <div className={styles.dropdown}>
          <span className={styles.dropdownTitle}>Pedidos em standby</span>

          {loading && (
            <div className={styles.state}>
              <span className={styles.spinner} /> Buscando...
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className={styles.state}>Nenhum pedido em standby</div>
          )}

          {!loading && orders.map(order => (
            <div key={order.code} className={styles.item}>
              <span className={styles.itemLabel}>{order.label}</span>
              <button
                className={styles.btnLink}
                onClick={() => handleLink(order.code)}
                disabled={linking === order.code}
              >
                {linking === order.code
                  ? <span className={styles.spinner} />
                  : 'Vincular'
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}