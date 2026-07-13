import { apiRequest } from "./client"

export interface SupplierProfile {
  id: string
  company_name: string
  email: string
}

export interface CompanySupplier {
  id: string
  supplier: SupplierProfile
  credit_limit: string
  eom_payment_terms: number
}

export interface InviteSupplierPayload {
  email: string
  company_name: string
}

export interface InviteSupplierResponse {
  detail: string
  supplier: CompanySupplier
}

/**
 * Fetch all suppliers associated with the procurement admin's company.
 */
export async function getSuppliers(): Promise<CompanySupplier[]> {
  return apiRequest<CompanySupplier[]>("/procurement/suppliers/")
}

/**
 * Invite a new supplier (or link an existing one) to the admin's company.
 */
export async function inviteSupplier(payload: InviteSupplierPayload): Promise<InviteSupplierResponse> {
  return apiRequest<InviteSupplierResponse>("/procurement/suppliers/invite/", {
    method: "POST",
    body: payload,
  })
}
