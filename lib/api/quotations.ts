import { apiRequest } from "./client"

export interface QuotationLineItem {
  id?: string
  description: string
  qty: number
  discount: number
  per: string
  each: number
  comments: string
  supplier_price?: string | null
}

export interface QuotationHistory {
  id: number
  message: string
  previous_total: string
  previous_pdf: string | null
  previous_line_items: any[]
  date_recorded: string
}

export interface Quotation {
  id: string
  quote_ref: string
  project: string
  main_folder?: string | null
  sub_folder?: string | null
  variation_ref?: string | null
  supplier: string
  supplier_email?: string | null
  date_of_quote: string
  quote_total: number
  status: "Pending" | "Approved" | "Rejected"
  po_created: boolean
  date_po_created?: string | null
  procurement_comments?: string | null
  finance_comments?: string | null
  commercial_comments?: string | null
  quote_approval_reasons?: string | null
  requote_comments?: string | null
  project_name: string
  supplier_name: string
  main_folder_name?: string | null
  sub_folder_name?: string | null
  supplier_quote_pdf?: string | null
  line_items?: QuotationLineItem[]
  history?: QuotationHistory[]
  
  // Signatures
  sig_procurement_department?: boolean
  sig_procurement_department_date?: string | null
  sig_contracts_manager?: boolean
  sig_contracts_manager_date?: string | null
  sig_project_director?: boolean
  sig_project_director_date?: string | null
  sig_managing_director?: boolean
  sig_managing_director_date?: string | null
  sig_commercial_department?: boolean
  sig_commercial_department_date?: string | null
  fully_approved?: boolean
}

export interface ProjectSubfolder {
  id: string
  name: string
}

export interface ProjectFolder {
  id: string
  name: string
  subfolders: ProjectSubfolder[]
}

export interface ProcurementProject {
  id: string
  project_name: string
  folders: ProjectFolder[]
}

export const getQuotations = async (): Promise<Quotation[]> => {
  return apiRequest<Quotation[]>("/procurement/quotations/")
}

export const createQuotation = async (payload: Partial<Quotation>): Promise<Quotation> => {
  return apiRequest<Quotation>("/procurement/quotations/", {
    method: "POST",
    body: payload,
  })
}

export const getProcurementProjects = async (): Promise<ProcurementProject[]> => {
  return apiRequest<ProcurementProject[]>("/procurement/projects/")
}

export const getSupplierQuotation = async (token: string): Promise<Quotation> => {
  return apiRequest<Quotation>(`/procurement/supplier-quote/${token}/`, {
    public: true,
  })
}

export const submitSupplierQuotation = async (token: string, data: FormData): Promise<Quotation> => {
  return apiRequest<Quotation>(`/procurement/supplier-quote/${token}/`, {
    method: "PATCH",
    body: data as any,
    public: true,
  })
}

export const requestRequote = async (id: string, comments: string): Promise<Quotation> => {
  return apiRequest<Quotation>(`/procurement/quotations/${id}/request_requote/`, {
    method: "POST",
    body: { comments },
  })
}

export const patchQuotation = async (id: string, payload: Partial<Quotation>): Promise<Quotation> => {
  return apiRequest<Quotation>(`/procurement/quotations/${id}/`, {
    method: "PATCH",
    body: payload,
  })
}

export const patchQuotationComments = async (
  id: string,
  comments: { procurement_comments?: string; commercial_comments?: string }
): Promise<Quotation> => {
  return apiRequest<Quotation>(`/procurement/quotations/${id}/`, {
    method: "PATCH",
    body: comments,
  })
}

export const approveQuotation = async (id: string): Promise<Quotation> => {
  return apiRequest<Quotation>(`/procurement/quotations/${id}/approve/`, {
    method: "PATCH",
  })
}

export const toggleQuotationSignature = async (
  id: string,
  approve: boolean
): Promise<Quotation> => {
  return apiRequest<Quotation>(`/procurement/quotations/${id}/toggle_signature/`, {
    method: "POST",
    body: { approve },
  })
}
