// --- Request ---

import { UUID } from "crypto";
import { PaymentMethod } from "./enum.types";

export interface LoginRequest {
  email: string;
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

// --- Profile ---

export interface UpdateProfileRequest {
  paymentMethods: string[];
  establishmentName?: string;
  address?: string;
}

export interface ProfileResponse {
  email: string;
  paymentMethods: string[];
  establishmentName?: string;
  address?: string;
}

export interface UserInfo {
  id: UUID;
  methods: PaymentMethod[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "RESTAURANT" | "DELIVERYMAN";
  token: string;
}