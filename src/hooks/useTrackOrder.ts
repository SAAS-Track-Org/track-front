import { useEffect, useState } from "react";
import { trackService } from "@/services/api/track.service";
import { usePolling } from "@/hooks/usePolling";
import type { SaveClientDataRequest } from "@/types/client.types";
import type { TrackOrderResponse } from "@/types/orders.types";

interface UseTrackOrderResult {
  order: TrackOrderResponse | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveClientData: (payload: SaveClientDataRequest) => Promise<void>;
}

export function useTrackOrder(
  publicCodeClient: string,
  orderCode: string,
): UseTrackOrderResult {
  const [order, setOrder] = useState<TrackOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    trackService
      .getOrder(publicCodeClient, orderCode)
      .then(setOrder)
      .catch(() => setError("Pedido não encontrado"))
      .finally(() => setLoading(false));
  }, [publicCodeClient, orderCode]);

  usePolling(
      () => {
        trackService
          .getOrder(publicCodeClient, orderCode)
          .then(setOrder)
          .catch(() => {});
      },
      { interval: 5000, runOnMount: false },
    );

  const saveClientData = async (payload: SaveClientDataRequest) => {
    setSaving(true);
    try {
      await trackService.saveClientData(publicCodeClient, orderCode, payload);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              clientName:    payload.clientName,
              clientPhone:   payload.clientPhone,
              address:       payload.address,
              paymentMethod: payload.paymentMethod,
              addressStatus: "ADDRESS_CONFIRMED",
            }
          : prev,
      );
    } finally {
      setSaving(false);
    }
  };

  return { order, loading, error, saving, saveClientData };
}