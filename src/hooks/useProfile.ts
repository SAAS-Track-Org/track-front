import { useCallback, useEffect, useState } from 'react'
import { authService } from '@/services/api/login.service'
import type { PaymentMethod, UpdateProfileRequest } from '@/types/login.types'

interface UseProfileResult {
  paymentMethods: PaymentMethod[]
  establishmentName: string
  address: string
  loading: boolean
  saving: boolean
  saved: boolean
  error: string | null
  setPaymentMethods: (v: PaymentMethod[]) => void
  setEstablishmentName: (v: string) => void
  setAddress: (v: string) => void
  save: () => Promise<void>
}

export function useProfile(): UseProfileResult {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [establishmentName, setEstablishmentName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carrega perfil atual ao montar
  useEffect(() => {
    authService
      .getProfile()
      .then((profile) => {
        setPaymentMethods((profile.paymentMethods as PaymentMethod[]) ?? [])
        setEstablishmentName(profile.establishmentName ?? '')
        setAddress(profile.address ?? '')
      })
      .catch(() => {
        // perfil ainda não configurado — ok, começa em branco
      })
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const payload: UpdateProfileRequest = {
        paymentMethods,
        establishmentName: establishmentName.trim() || undefined,
        address: address.trim() || undefined,
      }
      const updated = await authService.updateProfile(payload)
      setPaymentMethods((updated.paymentMethods as PaymentMethod[]) ?? [])
      setEstablishmentName(updated.establishmentName ?? '')
      setAddress(updated.address ?? '')
      setSaved(true)
    } catch {
      setError('Não foi possível salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }, [paymentMethods, establishmentName, address])

  return {
    paymentMethods,
    establishmentName,
    address,
    loading,
    saving,
    saved,
    error,
    setPaymentMethods,
    setEstablishmentName,
    setAddress,
    save,
  }
}