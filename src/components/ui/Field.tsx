import styles from './Field.module.css'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  span2?: boolean
  children: React.ReactNode
}

export function Field({ label, error, hint, span2, children }: FieldProps) {
  return (
    <div className={`${styles.field} ${span2 ? styles.span2 : ''}`}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.error}>{error}</span>}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
    
  )
}