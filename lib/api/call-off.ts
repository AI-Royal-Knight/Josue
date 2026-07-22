import { apiRequest } from "./client"

export interface CallOffHistoryEntryAPI {
  id: number
  call_off_ref: string
  date: string
  qty: string
  price: string
  expected_delivery_date: string | null
  call_off_by_name: string | null
  approve_by_name: string | null
}

export interface CallOffLineItemAPI {
  id: number
  description: string
  qty: string
  per: string
  each: string
  po_ref: string
  project_name: string
  main_folder_name: string | null
  sub_folder_name: string | null
  variation_ref: string | null
  supplier_name: string
  supplier_email: string | null
  management_approved: boolean
  management_approved_date: string | null
  qty_remaining: string
  history: CallOffHistoryEntryAPI[]
}

export const getCallOffList = async (): Promise<CallOffLineItemAPI[]> => {
  return apiRequest<CallOffLineItemAPI[]>("/procurement/call-offs/")
}

export const toggleCallOffManagementApproval = async (id: string, approved: boolean): Promise<CallOffLineItemAPI> => {
  return apiRequest<CallOffLineItemAPI>(`/procurement/call-offs/${id}/`, {
    method: "PATCH",
    body: {
      management_approved: approved,
      management_approved_date: approved ? new Date().toISOString().slice(0, 10) : null
    },
  })
}

export const createCallOff = async (
  id: string,
  payload: { qty: number; price: number; expected_delivery_date?: string; call_off_ref?: string }
): Promise<CallOffLineItemAPI> => {
  return apiRequest<CallOffLineItemAPI>(`/procurement/call-offs/${id}/create_call_off/`, {
    method: "POST",
    body: payload,
  })
}
