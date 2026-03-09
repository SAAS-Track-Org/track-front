import { useState } from 'react'

interface CepResult {
  street: string
  neighborhood: string
  city: string
  state: string
}

interface UseCepResult {
  loading: boolean
  error: string | null
  fetchCep: (cep: string) => Promise<CepResult | null>
}

export function useCep(): UseCepResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCep = async (cep: string): Promise<CepResult | null> => {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return null

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()

      if (data.erro) {
        setError('CEP não encontrado')
        return null
      }

      return {
        street: data.logradouro ?? '',
        neighborhood: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
      }
    } catch {
      setError('Erro ao consultar CEP')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, fetchCep }
}