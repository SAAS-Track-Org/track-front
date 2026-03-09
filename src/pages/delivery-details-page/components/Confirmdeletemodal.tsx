import { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import styles from './Confirmdeletemodal.module.css'

interface Props {
  orderCode: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({ orderCode, onConfirm, onCancel }: Props) {
  // Fecha com ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <Trash2 size={22} />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>Deletar pedido</h3>
          <p className={styles.desc}>
            O pedido <span className={styles.code}>#{orderCode}</span> será removido
            permanentemente. Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.btnConfirm} onClick={onConfirm}>
            Sim, deletar
          </button>
        </div>
      </div>
    </div>
  )
}