import type { PaymentMethod } from "@/types";

// --- Request ---

export interface LoginRequest {
  email: string;
  paymentMethods: PaymentMethod[];
}

// --- Responses ---

export interface LoginResponse {
  token: string;
  email: string;
  sessionDurationHours: number;
  expiresAt: string;
}

export interface AuthConfigResponse {
  sessionDurationHours: number;
}