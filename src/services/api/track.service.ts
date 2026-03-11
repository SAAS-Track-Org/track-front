import { api } from "./client";
import type { TrackOrderResponse } from "@/types/orders.types";
import type { SaveClientDataRequest } from "@/types/client.types";

export const trackService = {
  getOrder: async (
    publicCodeClient: string,
    orderCode: string,
  ): Promise<TrackOrderResponse> => {
    const { data } = await api.get(`/track/${publicCodeClient}/${orderCode}`);
    return data;
  },

  saveClientData: async (
    publicCodeClient: string,
    orderCode: string,
    payload: SaveClientDataRequest,
  ): Promise<void> => {
    await api.patch(`/track/${publicCodeClient}/${orderCode}`, payload);
  },
};
