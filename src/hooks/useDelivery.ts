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
  const [locationGranted, setLocationGranted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // ── Busca dados da entrega ──
  useEffect(() => {
    setLoading(true);
    deliveryService
      .driver(publicCodeDeliveryman)
      .then(setDelivery)
      .catch(() => setError("Entrega não encontrada"))
      .finally(() => setLoading(false));
  }, [publicCodeDeliveryman]);

  // ── Solicita permissão de geolocalização IMEDIATAMENTE ao montar ──
  useEffect(() => {
    if (!navigator.geolocation) return;

    // Solicita uma vez imediatamente — isso abre o popup do browser
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationGranted(true);
        const current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        lastLocationRef.current = current;
        deliveryService
          .updateLocation(publicCodeDeliveryman, current.lat, current.lng)
          .catch(() => {});
      },
      () => {
        // Usuário negou ou erro — continua sem localização
        setLocationGranted(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [publicCodeDeliveryman]);

  // ── Geolocalização a cada 3 segundos (só começa após permissão) ──
  useEffect(() => {
    if (!navigator.geolocation || !locationGranted) return;

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

    intervalRef.current = setInterval(sendLocation, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [publicCodeDeliveryman, locationGranted]);

  // ── Inicia entrega ──
  const startDelivery = async () => {
    if (!delivery) return;
    setStarting(true);
    try {
      const activeOrders = delivery.orders.filter(
        (o) =>
          o.deliveryStatus !== "DELIVERED" && o.deliveryStatus !== "CANCELLED",
      );

      await Promise.all(
        activeOrders.map((o) =>
          deliveryService.updateOrderStatus(
            delivery.deliveryId,
            o.orderCode,
            "ON_THE_WAY",
          ),
        ),
      );

      if (activeOrders.length > 0) {
        await deliveryService.updateOrderStatus(
          delivery.deliveryId,
          activeOrders[0].orderCode,
          "ARRIVING",
        );
      }

      setDelivery((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "IN_TRANSIT",
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

  // ── Entrega um pedido ──
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
              return { ...o, deliveryStatus: "DELIVERED" as OrderDeliveryStatus };
            if (o.orderCode === nextCode)
              return { ...o, deliveryStatus: "ARRIVING" as OrderDeliveryStatus };
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