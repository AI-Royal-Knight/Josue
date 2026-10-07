/**
 * Auth API — login and token refresh.
 */
import { apiRequest } from "./client"

export interface LoginPayload {
  email: string
  password: string
  otp?: string
}

export interface RoleAssignment {
  id: number
  role: string
  company_id: number | null
  project_id: number | null
}

export interface LoginSuccessResponse {
  success: boolean
  requires_2fa?: false
  access_token: string
  refresh_token: string
  user: {
    email: string
    first_name: string
    last_name: string
    role: string
    secondary_role?: string
    /** Present only if the user has multiple project role assignments */
    role_assignments?: RoleAssignment[]
  }
}

export interface Login2FAResponse {
  success: boolean
  requires_2fa: true
  email: string
  message: string
}

export type LoginResponse = LoginSuccessResponse | Login2FAResponse

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/account/login/", {
    method: "POST",
    body: payload,
    public: true,
  })
}

export async function verify2FA(payload: { email: string; otp: string }): Promise<LoginSuccessResponse> {
  return apiRequest<LoginSuccessResponse>("/account/login/verify-2fa/", {
    method: "POST",
    body: payload,
    public: true,
  })
}

export async function resend2FA(payload: { email: string }): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>("/account/login/resend-2fa/", {
    method: "POST",
    body: payload,
    public: true,
  })
}

export interface ProfileData {
  first_name: string
  last_name: string
  email: string
  backup_email?: string
  two_factor_enabled?: boolean
  profile?: {
    company_name?: string
    vat_number?: string
    address?: string
    account_name?: string
    bank_name?: string
    bank_address?: string
    sort_code?: string
    account_number?: string
    iban?: string
    swift_bic?: string
    two_factor_enabled?: boolean
  }
}

export async function getProfile(): Promise<ProfileData> {
  return apiRequest<ProfileData>("/account/profile/")
}

export async function updateProfile(payload: Partial<ProfileData>): Promise<ProfileData> {
  return apiRequest<ProfileData>("/account/profile/", {
    method: "PUT",
    body: payload,
  })
}

export interface ChangePasswordPayload {
  old_password: string
  new_password: string
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/account/change-password/", {
    method: "POST",
    body: payload,
  })
}

export interface RequestAdminPayload {
  company_name: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
}

export async function requestAdminAccess(payload: RequestAdminPayload): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>("/account/request-admin/", {
    method: "POST",
    body: payload,
    public: true,
  })
}
