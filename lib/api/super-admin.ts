/**
 * Super Admin API service.
 * Endpoints under /api/v1/super-admin/
 */
import { apiRequest } from "./client"

// ── Overview ──────────────────────────────────────────────────────────────────

export interface OverviewStats {
  admin_users: number
  users: number
}

export interface RecentActivity {
  id: number
  message: string
  created_at: string
}

export interface OverviewResponse {
  statistics: OverviewStats
  recent_activities: RecentActivity[]
}

export async function getSuperAdminOverview(): Promise<OverviewResponse> {
  return apiRequest<OverviewResponse>("/super-admin/overview/")
}

// ── Companies ─────────────────────────────────────────────────────────────────

export interface CompanySummary {
  admin_users: number
  users: number
  projects: number
  active: number
  suspended: number
}

export interface CompanyRecord {
  id: string
  company_name: string | null
  admin_name: string | null
  admin_surname: string | null
  admin_email: string | null
  phone: string | null
  user: number
  projects: number
  activate: boolean
  monthly_subscription: string
  per_user_rate: string
  auto_monthly_inv: boolean
  status: "active" | "suspended"
}

export interface CompaniesResponse {
  summary: CompanySummary
  companies: CompanyRecord[]
}

export async function getCompanies(): Promise<CompaniesResponse> {
  return apiRequest<CompaniesResponse>("/super-admin/companies/")
}

export async function updateCompany(
  id: string,
  payload: Partial<CompanyRecord>
): Promise<CompanyRecord> {
  return apiRequest<CompanyRecord>(`/super-admin/companies/${id}/`, {
    method: "PATCH",
    body: payload,
  })
}

// ── Invite Admin ──────────────────────────────────────────────────────────────

export interface InviteAdminPayload {
  company_name: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
}

export interface InviteAdminResponse {
  message: string
  company_id: number
  invitation_expires_at: string
}

export async function inviteAdmin(
  payload: InviteAdminPayload
): Promise<InviteAdminResponse> {
  return apiRequest<InviteAdminResponse>("/super-admin/companies/", {
    method: "POST",
    body: payload,
  })
}

// ── Company Invitations ───────────────────────────────────────────────────────

export interface CompanyInvitationDetails {
  email: string
  first_name: string
  last_name: string
  company_name: string
  role: string
}

export async function validateCompanyInvitation(
  token: string
): Promise<CompanyInvitationDetails> {
  return apiRequest<CompanyInvitationDetails>(
    `/super-admin/invitations/validate/${token}/`,
    { public: true }
  )
}

export async function acceptCompanyInvitation(
  payload: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(
    "/super-admin/invitations/accept/",
    {
      method: "POST",
      body: payload,
      public: true,
    }
  )
}

// ── Invoices ──────────────────────────────────────────────────────────────

export interface MonthlyInvoice {
  id: number
  company_id: string
  year: number
  month: number
  amount: string | null
  is_sent: boolean
}

export async function getInvoices(year: number): Promise<MonthlyInvoice[]> {
  return apiRequest<MonthlyInvoice[]>(`/super-admin/invoices/?year=${year}`)
}

export interface SubmitInvoicePayload {
  company_id: string
  year: number
  month: number
  amount: number
}

export async function submitInvoice(
  payload: SubmitInvoicePayload
): Promise<MonthlyInvoice> {
  return apiRequest<MonthlyInvoice>("/super-admin/invoices/", {
    method: "POST",
    body: payload,
  })
}
