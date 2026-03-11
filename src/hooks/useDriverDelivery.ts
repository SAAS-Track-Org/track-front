import { useEffect, useState } from "react";
import { deliveryService } from "@/services/api/delivery.service";
import type { DeliverySummary } from "@/types/delivery.types";
import { usePolling } from "./usePolling";

interface UseDashboardDeliveriesResult {
  deliveries: DeliverySummary[];
  loading: boolean;
  error: string | null;
}

export function useDriverDelivery(): UseDashboardDeliveriesResult {
  const [deliveries, setDeliveries] = useState<DeliverySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    deliveryService
      .list()
      .then(setDeliveries)
      .catch(() => {
        setDeliveries([]);
        setError("Erro ao carregar entregas");
      })
      .finally(() => setLoading(false));
  }, []);

  usePolling(
    () => {
      deliveryService
        .list()
        .then(setDeliveries)
        .catch(() => {});
    },
    { interval: 5000, runOnMount: false },
  );

  return { deliveries, loading, error };
}
