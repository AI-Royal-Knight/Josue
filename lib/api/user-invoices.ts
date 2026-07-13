import { apiRequest } from "./client"

export type UserInvoiceApi = {
  id: string
  invoiceNumber: string
  date: string
  variationSheetNo: string
  nfiProformaNo: string
  project: string
  workArea: string
  workSection: string
  description: string
  sourceType: string
  createdBy: string
  userName: string
  sortCode: string
  accountNumber: string
  total: string
  totalRaw: number
  // Approval chain
  supervisorApproved: boolean
  supervisorApprovedDate: string
  contractsManagerApproved: boolean
  contractsManagerApprovedDate: string
  projectDirectorApproved: boolean
  projectDirectorApprovedDate: string
  managingDirectorApproved: boolean
  managingDirectorApprovedDate: string
  fullyApproved: boolean
  // Finance
  paid: boolean
  approved: boolean
  approvedBy: string
  datePaid: string
  paidBy: string
  financeComments: string
  commercialComments: string
  // invoice-list compat
  dateScheduled: string
  releaseDate: string
  comments: string
  scheduledBy: string
  no: string
}

export type InvoiceSummary = {
  total: number
  paid: number
  unpaid: number
  money_on_hold: string
}

export async function getUserInvoices(params?: {
  project_id?: string
  finance_view?: boolean
}): Promise<{ invoices: UserInvoiceApi[]; summary: InvoiceSummary }> {
  const qs = new URLSearchParams()
  if (params?.project_id) qs.set("project_id", params.project_id)
  if (params?.finance_view) qs.set("finance_view", "true")
  const query = qs.toString() ? `?${qs.toString()}` : ""
  return apiRequest(`/project-admin/user-invoices/${query}`)
}

export async function approveUserInvoice(
  invoiceId: string,
  approve: boolean
): Promise<{ invoice: UserInvoiceApi }> {
  return apiRequest(`/project-admin/user-invoices/${invoiceId}/approve/`, {
    method: "POST",
    body: { approve },
  })
}

export async function payUserInvoice(
  invoiceId: string,
  paid: boolean,
  financeComments?: string
): Promise<{ invoice: UserInvoiceApi }> {
  return apiRequest(`/project-admin/user-invoices/${invoiceId}/pay/`, {
    method: "POST",
    body: { paid, finance_comments: financeComments },
  })
}

export async function commentUserInvoice(
  invoiceId: string,
  commercialComments?: string
): Promise<{ invoice: UserInvoiceApi }> {
  return apiRequest(`/project-admin/user-invoices/${invoiceId}/commercial-comment/`, {
    method: "POST",
    body: { commercial_comments: commercialComments },
  })
}
