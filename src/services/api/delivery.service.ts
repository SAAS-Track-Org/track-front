import { api } from "./client";
import type {
  CreateDeliveryResponse,
  DeliverySummary,
  TrackDeliveryResponse,
  DeliveryDetailResponse,
  OrderDetail,
  StandbyOrderSummary,
  UpdateOrderRequest,
  UpdateDeliverymanRequest,
} from "@/types/delivery.types";

import type { OrderDeliveryStatus } from "@/types/enum.types";

import type { DriverDeliveryResponse } from "@/types/driver.types";

export const deliveryService = {
  // Dashboard — lista entregas
  list: async (): Promise<DeliverySummary[]> => {
    const { data } = await api.get<DeliverySummary[]>("/delivery");
    return data;
  },

  // Cria entrega (sem payload por enquanto)
  create: async (): Promise<CreateDeliveryResponse> => {
    const { data } = await api.post<CreateDeliveryResponse>("/delivery");
    return data;
  },

  // Detalhes de uma entrega
  detail: async (deliveryId: string): Promise<DeliveryDetailResponse> => {
    const { data } = await api.get<DeliveryDetailResponse>(
      `/delivery/${deliveryId}`,
    );
    return data;
  },

  // Adiciona pedido à entrega
  addOrder: async (deliveryId: string): Promise<OrderDetail> => {
    const { data } = await api.post<OrderDetail>(
      `/delivery/${deliveryId}/order`,
    );
    return data;
  },

  // Atualiza dados do entregador
  updateDeliveryman: async (
    deliveryId: string,
    payload: UpdateDeliverymanRequest,
  ): Promise<void> => {
    await api.put(`/delivery/${deliveryId}/deliveryman`, payload);
  },

  // Atualiza status do pedido (deletar, standby, etc.)
  updateOrderStatus: async (
    deliveryId: string,
    orderCode: string,
    deliveryStatus: OrderDeliveryStatus,
  ): Promise<void> => {
    await api.patch(`/delivery/${deliveryId}/order/${orderCode}/status`, {
      deliveryStatus,
    });
  },

  // Atualiza pedido
  updateOrder: async (
    deliveryId: string,
    orderCode: string,
    payload: UpdateOrderRequest,
  ): Promise<OrderDetail> => {
    const { data } = await api.put<OrderDetail>(
      `/delivery/${deliveryId}/order/${orderCode}`,
      payload,
    );
    return data;
  },

  // Cliente rastreia entrega
  track: async (
    publicCodeClient: string,
    orderCode: string,
  ): Promise<TrackDeliveryResponse> => {
    const { data } = await api.get<TrackDeliveryResponse>(
      `/delivery/track/${publicCodeClient}/${orderCode}`,
    );
    return data;
  },

  // Entregador vê detalhes da entrega
  driver: async (
    publicCodeDeliveryman: string,
  ): Promise<DriverDeliveryResponse> => {
    const { data } = await api.get<DriverDeliveryResponse>(
      `/delivery/driver/${publicCodeDeliveryman}`,
    );
    return data;
  },

  // Entregador atualiza localização
  updateLocation: async (
    publicCodeDeliveryman: string,
    lat: number,
    lng: number,
  ): Promise<void> => {
    await api.patch(`/delivery/${publicCodeDeliveryman}/location`, {
      lat,
      lng,
    });
  },

  // Lista todos os pedidos em standby do sistema
  listStandbyOrders: async (): Promise<StandbyOrderSummary[]> => {
    const { data } = await api.get<StandbyOrderSummary[]>("/order/standby");
    return data;
  },

  // Vincula pedido standby a uma entrega (muda status para WAITING)
  linkStandbyOrder: async (
    deliveryId: string,
    orderCode: string,
  ): Promise<OrderDetail> => {
    const { data } = await api.patch<OrderDetail>(
      `/delivery/${deliveryId}/order/${orderCode}/link`,
    );
    return data;
  },
};
