// --- Request ---

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

export type PaymentMethod =
  | 'CASH'
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'MEAL_VOUCHER'
  | 'FOOD_VOUCHER'