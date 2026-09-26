import { apiRequest } from "./client"

export interface FinanceSupplierInvoice {
  id: string
  quote_ref: string
  date_of_quote: string
  project_name: string
  user_name: string | null
  sort_code: string | null
  account_number: string | null
  quote_total: number
  paid: boolean
  paid_by_name: string | null
  date_scheduled: string | null
  release_date: string | null
  finance_comments: string | null
  procurement_comments: string | null
  commercial_comments: string | null
  supplier_name: string | null
  credit_limit: number
  eom_payment_terms: number
  month_credit_used: number
  available_credit: number
  previous_month: number
  invoice_due_this_month: number
  supplier_quote_pdf_url: string | null
}

export const getFinanceSupplierInvoices = (): Promise<FinanceSupplierInvoice[]> =>
  apiRequest<FinanceSupplierInvoice[]>("/finance/supplier-invoices/")

export const patchFinanceSupplierInvoice = (
  id: string,
  payload: Partial<Pick<FinanceSupplierInvoice, "paid" | "date_scheduled" | "release_date" | "finance_comments">>
): Promise<FinanceSupplierInvoice> =>
  apiRequest<FinanceSupplierInvoice>(`/finance/supplier-invoices/${id}/`, {
    method: "PATCH",
    body: payload,
  })
