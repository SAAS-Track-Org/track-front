import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={`${styles.input} ${error ? styles.inputError : ''} ${className ?? ''}`}
      {...props}
    />
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={`${styles.textarea} ${className ?? ''}`}
      {...props}
    />
  )
}
