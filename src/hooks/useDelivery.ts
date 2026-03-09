import { useEffect, useRef, useState } from "react";
import { deliveryService } from "@/services/api/delivery.service";
import type { DriverDeliveryResponse, OrderDeliveryStatus } from "@/types";

interface UseDriverDeliveryResult {
  delivery: DriverDeliveryResponse | null;
  loading: boolean;
  error: string | null;
  starting: boolean;
  deliveringOrder: string | null;
  startDelivery: () => Promise<void>;
  deliverOrder: (orderCode: string) => Promise<void>;
}

export function useDriverDelivery(
  publicCodeDeliveryman: string,
): UseDriverDeliveryResult {
  const [delivery, setDelivery] = useState<DriverDeliveryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [deliveringOrder, setDeliveringOrder] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLoading(true);
    deliveryService
      .driver(publicCodeDeliveryman)
      .then(setDelivery)
      .catch(() => setError("Entrega não encontrada"))
      .finally(() => setLoading(false));
  }, [publicCodeDeliveryman]);

  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Calcula distância em metros entre dois pontos (Haversine simplificado)
  const distanceInMeters = (
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ) => {
    const R = 6371000;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x = dLat;
    const y = dLng * Math.cos((a.lat * Math.PI) / 180);
    return R * Math.sqrt(x * x + y * y);
  };

  // ── Geolocalização a cada 3 segundos ──
  useEffect(() => {
    if (!navigator.geolocation) return;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const current = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          const last = lastLocationRef.current;

          if (last && distanceInMeters(last, current) < 5) return;

          lastLocationRef.current = current;
          deliveryService
            .updateLocation(publicCodeDeliveryman, current.lat, current.lng)
            .catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 },
      );
    };

    sendLocation();
    intervalRef.current = setInterval(sendLocation, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [publicCodeDeliveryman]);

  // Ao iniciar: primeiro pedido ARRIVING, restantes ON_THE_WAY
  const startDelivery = async () => {
    if (!delivery) return;
    setStarting(true);
    try {
      const activeOrders = delivery.orders.filter(
        (o) =>
          o.deliveryStatus !== "DELIVERED" && o.deliveryStatus !== "CANCELLED",
      );

      // Atualiza todos para ON_THE_WAY em paralelo
      await Promise.all(
        activeOrders.map((o) =>
          deliveryService.updateOrderStatus(
            delivery.deliveryId,
            o.orderCode,
            "ON_THE_WAY",
          ),
        ),
      );

      // Primeiro vira ARRIVING
      if (activeOrders.length > 0) {
        await deliveryService.updateOrderStatus(
          delivery.deliveryId,
          activeOrders[0].orderCode,
          "ARRIVING",
        );
      }

      // Atualiza estado local
      setDelivery((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "IN_TRANSIT", // ← adiciona isso
          orders: prev.orders.map((o) => {
            const activeIdx = activeOrders.findIndex(
              (a) => a.orderCode === o.orderCode,
            );
            if (activeIdx === -1) return o;
            return {
              ...o,
              deliveryStatus:
                activeIdx === 0
                  ? "ARRIVING"
                  : ("ON_THE_WAY" as OrderDeliveryStatus),
            };
          }),
        };
      });
    } finally {
      setStarting(false);
    }
  };

  // Ao entregar: muda para DELIVERED e próximo vira ARRIVING
  const deliverOrder = async (orderCode: string) => {
    if (!delivery) return;
    setDeliveringOrder(orderCode);
    try {
      await deliveryService.updateOrderStatus(
        delivery.deliveryId,
        orderCode,
        "DELIVERED",
      );

      const activeOrders = delivery.orders.filter(
        (o) =>
          o.deliveryStatus !== "DELIVERED" &&
          o.deliveryStatus !== "CANCELLED" &&
          o.orderCode !== orderCode,
      );

      // Próximo pedido vira ARRIVING
      if (activeOrders.length > 0) {
        await deliveryService.updateOrderStatus(
          delivery.deliveryId,
          activeOrders[0].orderCode,
          "ARRIVING",
        );
      }

      setDelivery((prev) => {
        if (!prev) return prev;
        const nextCode = activeOrders[0]?.orderCode;
        return {
          ...prev,
          orders: prev.orders.map((o) => {
            if (o.orderCode === orderCode)
              return {
                ...o,
                deliveryStatus: "DELIVERED" as OrderDeliveryStatus,
              };
            if (o.orderCode === nextCode)
              return {
                ...o,
                deliveryStatus: "ARRIVING" as OrderDeliveryStatus,
              };
            return o;
          }),
        };
      });
    } finally {
      setDeliveringOrder(null);
    }
  };

  return {
    delivery,
    loading,
    error,
    starting,
    deliveringOrder,
    startDelivery,
    deliverOrder,
  };
}
