import { useCallback, useEffect, useState } from "react";
import { deliveryService } from "@/services/api/delivery.service";

import { OrderDeliveryStatus } from "@/types/enum.types";

import {
  DeliveryDetailResponse,
  UpdateDeliverymanRequest,
  UpdateOrderRequest,
} from "@/types/delivery.types";
import { UserInfo } from "@/types/user.types";

interface UseDeliveryDetailsResult {
  delivery: DeliveryDetailResponse | null;
  userInfo?: UserInfo;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addOrder: () => Promise<void>;
  updateOrder: (
    orderCode: string,
    payload: UpdateOrderRequest,
  ) => Promise<void>;
  updateOrderStatus: (
    orderCode: string,
    status: OrderDeliveryStatus,
  ) => Promise<void>;
  linkStandbyOrder: (orderCode: string) => Promise<void>;
  updateDeliveryman: (payload: UpdateDeliverymanRequest) => Promise<void>;
  savingOrder: string | null;
  savingDeliveryman: boolean;
}

export function useDeliveryDetails(
  deliveryId: string,
): UseDeliveryDetailsResult {
  const [delivery, setDelivery] = useState<DeliveryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [savingDeliveryman, setSavingDeliveryman] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    deliveryService
      .detail(deliveryId)
      .then(setDelivery)
      .catch(() => setError("Entrega não encontrada"))
      .finally(() => setLoading(false));
  }, [deliveryId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addOrder = async () => {
    const newOrder = await deliveryService.addOrder(deliveryId);
    setDelivery((prev) =>
      prev ? { ...prev, orders: [...prev.orders, newOrder] } : prev,
    );
  };

  const updateOrder = async (
    orderCode: string,
    payload: UpdateOrderRequest,
  ) => {
    setSavingOrder(orderCode);
    try {
      const updated = await deliveryService.updateOrder(
        deliveryId,
        orderCode,
        payload,
      );
      setDelivery((prev) =>
        prev
          ? {
              ...prev,
              orders: prev.orders.map((o) =>
                o.code === orderCode ? updated : o,
              ),
            }
          : prev,
      );
    } finally {
      setSavingOrder(null);
    }
  };

  const updateOrderStatus = async (
    orderCode: string,
    status: OrderDeliveryStatus,
  ) => {
    setSavingOrder(orderCode);
    try {
      await deliveryService.updateOrderStatus(deliveryId, orderCode, status);
      setDelivery((prev) => {
        if (!prev) return prev;
        if (status === "DELETED" || status === "STANDBY") {
          return {
            ...prev,
            orders: prev.orders.filter((o) => o.code !== orderCode),
          };
        }
        return {
          ...prev,
          orders: prev.orders.map((o) =>
            o.code === orderCode ? { ...o, deliveryStatus: status } : o,
          ),
        };
      });
    } finally {
      setSavingOrder(null);
    }
  };

  const linkStandbyOrder = async (orderCode: string) => {
    setSavingOrder(orderCode);
    try {
      const linked = await deliveryService.linkStandbyOrder(
        deliveryId,
        orderCode,
      );
      setDelivery((prev) =>
        prev ? { ...prev, orders: [...prev.orders, linked] } : prev,
      );
    } finally {
      setSavingOrder(null);
    }
  };

  const updateDeliveryman = async (payload: UpdateDeliverymanRequest) => {
    setSavingDeliveryman(true);
    try {
      await deliveryService.updateDeliveryman(deliveryId, payload);
      setDelivery((prev) =>
        prev
          ? {
              ...prev,
              deliverymanName: payload.name ?? prev.deliverymanName,
              deliverymanPhone: payload.phoneNumber ?? prev.deliverymanPhone,
            }
          : prev,
      );
    } finally {
      setSavingDeliveryman(false);
    }
  };

  return {
    delivery,
    loading,
    error,
    refetch: fetch,
    addOrder,
    updateOrder,
    updateOrderStatus,
    linkStandbyOrder,
    updateDeliveryman,
    savingOrder,
    savingDeliveryman,
  };
}
