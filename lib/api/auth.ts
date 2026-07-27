/**
 * Auth API — login and token refresh.
 */
import { apiRequest } from "./client"

export interface LoginPayload {
  email: string
  password: string
}

export interface RoleAssignment {
  id: number
  role: string
  company_id: number | null
  project_id: number | null
}

export interface LoginResponse {
  success: boolean
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

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/account/login/", {
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
