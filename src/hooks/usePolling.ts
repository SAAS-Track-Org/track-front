import { useEffect, useRef } from 'react'

interface UsePollingOptions {
  interval?: number      // ms — padrão 10s
  enabled?: boolean      // para pausar o polling
  runOnMount?: boolean   // executa imediatamente ao montar (padrão true)
}

/**
 * Executa uma função de forma periódica.
 *
 * @example
 * usePolling(() => refetch(), { interval: 10_000, enabled: status !== 'DELIVERED' })
 */
export function usePolling(
  callback: () => void,
  options: UsePollingOptions = {},
) {
  const { interval = 10_000, enabled = true, runOnMount = true } = options

  const callbackRef = useRef(callback)

  // Mantém a referência sempre atualizada sem recriar o interval
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    if (runOnMount) callbackRef.current()

    const id = setInterval(() => callbackRef.current(), interval)

    return () => clearInterval(id)
  }, [interval, enabled, runOnMount])
}