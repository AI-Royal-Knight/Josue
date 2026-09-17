import { apiRequest } from "./client"

export interface SupplierProfile {
  id: string
  company_name: string
  email: string
}

export interface CompanySupplier {
  id: string
  supplier: SupplierProfile
  status: "pending" | "active" | "declined" | "revoked"
  credit_limit: string
  eom_payment_terms: number
  invited_at: string
  accepted_at: string | null
  declined_at: string | null
  invitation_token: string | null
  invitation_link: string | null
}

export interface InviteSupplierPayload {
  email: string
  company_name: string
}

export interface InviteSupplierResponse {
  detail: string
  supplier: CompanySupplier
  invitation_token?: string
  invitation_link?: string
  is_new_supplier?: boolean
}

export interface SupplierInvitationDetails {
  token: string
  email: string
  supplier_name: string
  company_name: string
  company_id: string
  status: "pending" | "accepted" | "declined" | "expired"
  expires_at: string
  is_expired: boolean
  is_existing_user: boolean
}

export interface AcceptSupplierInvitationPayload {
  first_name?: string
  last_name?: string
  company_name?: string
  password?: string
}

export interface AcceptSupplierInvitationResponse {
  success: boolean
  message: string
  access_token?: string
  refresh_token?: string
  user?: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
  }
  company?: {
    id: string
    company_name: string
  }
}

export interface SupplierCompanyRelationship {
  id: string
  company_id: string
  company_name: string
  company_logo: string | null
  relationship_status: "pending" | "active" | "declined" | "revoked"
  eom_payment_terms: number
  credit_limit: string
  invited_at: string
  accepted_at: string | null
}

export interface SupplierInvoice {
  id: string
  company_id: string
  company_name: string
  supplier_name: string
  supplier_email: string
  invoice_number: string
  invoice_date: string
  amount: string
  description: string
  file: string | null
  file_url: string | null
  status: "submitted" | "processing" | "approved" | "rejected" | "paid"
  procurement_comments: string
  // PO / Call-Off linkage
  po_reference: string | null
  call_off_reference: string | null
  call_off_amount: string | null
  call_off_qty: string | null
  created_at: string
}

export interface ProcurementSupplierInvoice extends SupplierInvoice {
  processed_at?: string | null
}

/** A single call-off entry within a PO group */
export interface SupplierCallOff {
  id: string
  call_off_ref: string
  price: string
  qty: string
  total: string
  date: string
  expected_delivery_date: string | null
  line_item_description: string
}

/** A PO (Quotation) with its associated call-offs, returned from GET /supplier/call-offs/ */
export interface SupplierCallOffGroup {
  po_ref: string
  quotation_id: string
  project_name: string
  call_offs: SupplierCallOff[]
}

/* ==========================================================================
   Procurement Side APIs
   ========================================================================== */

/**
 * Fetch all suppliers associated with the procurement user's company.
 */
export async function getSuppliers(): Promise<CompanySupplier[]> {
  return apiRequest<CompanySupplier[]>("/procurement/suppliers/")
}

/**
 * Invite a supplier to the company.
 */
export async function inviteSupplier(payload: InviteSupplierPayload): Promise<InviteSupplierResponse> {
  return apiRequest<InviteSupplierResponse>("/procurement/suppliers/invite/", {
    method: "POST",
    body: payload,
  })
}

/**
 * Fetch all supplier invoices submitted for the procurement user's company.
 */
export async function getProcurementSupplierInvoices(): Promise<ProcurementSupplierInvoice[]> {
  return apiRequest<ProcurementSupplierInvoice[]>("/procurement/supplier-invoices/")
}

/**
 * Update a supplier invoice status or add procurement comments.
 */
export async function updateProcurementSupplierInvoice(
  id: string,
  payload: { status?: string; procurement_comments?: string }
): Promise<ProcurementSupplierInvoice> {
  return apiRequest<ProcurementSupplierInvoice>(`/procurement/supplier-invoices/${id}/`, {
    method: "PATCH",
    body: payload,
  })
}

/* ==========================================================================
   Supplier Side APIs
   ========================================================================== */

/**
 * Validate and get supplier invitation details by token.
 */
export async function getSupplierInvitation(token: string): Promise<SupplierInvitationDetails> {
  return apiRequest<SupplierInvitationDetails>(`/supplier/invitations/${token}/`, {
    public: true,
  })
}

/**
 * Accept a supplier invitation.
 */
export async function acceptSupplierInvitation(
  token: string,
  payload: AcceptSupplierInvitationPayload
): Promise<AcceptSupplierInvitationResponse> {
  return apiRequest<AcceptSupplierInvitationResponse>(`/supplier/invitations/${token}/accept/`, {
    method: "POST",
    body: payload,
    public: true,
  })
}

/**
 * Decline a supplier invitation.
 */
export async function declineSupplierInvitation(token: string): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(`/supplier/invitations/${token}/decline/`, {
    method: "POST",
    public: true,
  })
}

/**
 * Dedicated Supplier Login.
 */
export async function supplierLogin(payload: { email: string; password: string }): Promise<{
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
  }
  active_companies: {
    id: string
    company_name: string
    credit_limit: string
    eom_payment_terms: number
  }[]
}> {
  return apiRequest("/supplier/auth/login/", {
    method: "POST",
    body: payload,
    public: true,
  })
}

/**
 * Fetch company relationships for the logged in supplier.
 */
export async function getSupplierCompanies(): Promise<SupplierCompanyRelationship[]> {
  return apiRequest<SupplierCompanyRelationship[]>("/supplier/companies/")
}

/**
 * Fetch invoices submitted by the supplier for the selected company.
 */
export async function getSupplierInvoices(companyId: string): Promise<SupplierInvoice[]> {
  return apiRequest<SupplierInvoice[]>("/supplier/invoices/", {
    headers: {
      "X-Company-ID": companyId,
    },
  })
}

/**
 * Submit an invoice to a company.
 */
export async function submitSupplierInvoice(
  companyId: string,
  formData: FormData
): Promise<SupplierInvoice> {
  return apiRequest<SupplierInvoice>("/supplier/invoices/", {
    method: "POST",
    body: formData,
    headers: {
      "X-Company-ID": companyId,
    },
  })
}

import type { Quotation, QuotationLineItem } from "./quotations"
export type { Quotation, QuotationLineItem }

/**
 * Fetch quotations / RFQs assigned to the supplier for the selected company.
 */
export async function getSupplierQuotations(companyId: string): Promise<Quotation[]> {
  return apiRequest<Quotation[]>("/supplier/quotations/", {
    headers: {
      "X-Company-ID": companyId,
    },
  })
}

/**
 * Fetch a specific quotation / RFQ detail for the supplier.
 */
export async function getSupplierQuotationDetail(
  companyId: string,
  id: number | string
): Promise<Quotation> {
  return apiRequest<Quotation>(`/supplier/quotations/${id}/`, {
    headers: {
      "X-Company-ID": companyId,
    },
  })
}

/**
 * Submit pricing and quote document for an RFQ directly from the supplier portal.
 */
export async function submitSupplierQuotationById(
  companyId: string,
  id: number | string,
  formData: FormData
): Promise<Quotation> {
  return apiRequest<Quotation>(`/supplier/quotations/${id}/`, {
    method: "PATCH",
    body: formData,
    headers: {
      "X-Company-ID": companyId,
    },
  })
}

/**
 * Fetch all call-offs for this supplier grouped by PO (quote_ref).
 * Used to populate the two-level PO → Call-Off selector on the invoice submission form.
 */
export async function getSupplierCallOffs(companyId: string): Promise<SupplierCallOffGroup[]> {
  return apiRequest<SupplierCallOffGroup[]>("/supplier/call-offs/", {
    headers: {
      "X-Company-ID": companyId,
    },
  })
}
