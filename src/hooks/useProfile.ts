import { useCallback, useEffect, useState } from "react";
import { authService } from "@/services/api/login.service";
import type { UpdateProfileRequest } from "@/types/user.types";
import type { PaymentMethod } from "@/types/enum.types";

interface UseProfileResult {
  // Estado salvo no servidor — usado para lógica da página
  committedPaymentMethods: PaymentMethod[];
  // Estado editável do formulário — usado pelo modal
  paymentMethods: PaymentMethod[];
  establishmentName: string;
  address: string;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
  setPaymentMethods: (v: PaymentMethod[]) => void;
  setEstablishmentName: (v: string) => void;
  setAddress: (v: string) => void;
  save: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  // Estado confirmado (só atualiza após save bem-sucedido)
  const [committedPaymentMethods, setCommittedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);

  // Estado do formulário (atualiza a cada seleção)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [establishmentName, setEstablishmentName] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authService
      .getProfile()
      .then((profile) => {
        const methods = (profile.paymentMethods as PaymentMethod[]) ?? [];
        setCommittedPaymentMethods(methods);
        setPaymentMethods(methods);
        setEstablishmentName(profile.establishmentName ?? "");
        setAddress(profile.address ?? "");
      })
      .catch(() => {
        // perfil ainda não configurado — ok, começa em branco
      })
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload: UpdateProfileRequest = {
        paymentMethods,
        establishmentName: establishmentName.trim() || undefined,
        address: address.trim() || undefined,
      };
      const updated = await authService.updateProfile(payload);
      const methods = (updated.paymentMethods as PaymentMethod[]) ?? [];

      // Atualiza tanto o estado committed quanto o formulário
      setCommittedPaymentMethods(methods);
      setPaymentMethods(methods);
      setEstablishmentName(updated.establishmentName ?? "");
      setAddress(updated.address ?? "");
      setSaved(true);
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [paymentMethods, establishmentName, address]);

  return {
    committedPaymentMethods,
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
  };
}
