import { apiRequest } from "./client"

// ── Types ──────────────────────────────────────────────────────────────────

export type VariationLineApi = {
  id: string
  site_instruction: string
  work_area: string
  work_section: string
  labour: string
  labour_target: string
  material: string
  qty: string
  line_total: number
}

export type VariationApi = {
  id: string
  vo_number: string
  variation_sheet_number: string
  date: string
  project: string
  project_name: string
  site_instruction_no: string
  attention_of: string
  description_of_works: string
  comments: string
  total_amount: string
  approval_status: "pending" | "approved" | "rejected"
  approved_by: string | null
  approved_by_name: string
  submitted_to_client: boolean
  signed_by_client: boolean
  client_name?: string
  client_email?: string
  created_by: string | null
  created_by_name: string
  lines: VariationLineApi[]
  assigned_user_ids?: string[]
  evidence_url?: string | null

  // Signatures
  supervisor_approved?: boolean
  supervisor_approved_date?: string | null
  manager_approved?: boolean
  manager_approved_date?: string | null
  contracts_manager_approved?: boolean
  contracts_manager_approved_date?: string | null
  project_director_approved?: boolean
  project_director_approved_date?: string | null
  managing_director_approved?: boolean
  managing_director_approved_date?: string | null
  commercial_department_approved?: boolean
  commercial_department_approved_date?: string | null
  fully_approved?: boolean
}

export type CreateVariationPayload = {
  project_id: string
  site_instruction_no: string
  attention_of: string
  description_of_works: string
  comments: string
  lines: {
    siteInstruction: string
    workArea: string
    workSection: string
    labour: number
    labourTarget: number
    material: number
    qty: number
  }[]
  evidence?: File | null
}

// ── API Functions ──────────────────────────────────────────────────────────

export async function getVariations(projectId?: string): Promise<{ variations: VariationApi[] }> {
  const url = projectId
    ? `/commercial/variations/?project_id=${projectId}`
    : `/commercial/variations/`
  return apiRequest(url)
}

export async function createVariation(data: CreateVariationPayload): Promise<VariationApi> {
  const fd = new FormData()
  fd.append("project_id", data.project_id)
  fd.append("site_instruction_no", data.site_instruction_no)
  fd.append("attention_of", data.attention_of)
  fd.append("description_of_works", data.description_of_works)
  fd.append("comments", data.comments)
  fd.append("lines", JSON.stringify(data.lines))
  if (data.evidence) {
    fd.append("evidence", data.evidence)
  }

  return apiRequest("/commercial/variations/", {
    method: "POST",
    body: fd,
  })
}

export async function approveVariation(id: string, action: "approve" | "reject"): Promise<VariationApi> {
  return apiRequest(`/commercial/variations/${id}/approve/`, {
    method: "POST",
    body: { action },
  })
}

export async function submitVariationToClient(
  id: string,
  payload?: { client_name?: string; client_email?: string }
): Promise<VariationApi> {
  return apiRequest(`/commercial/variations/${id}/submit-to-client/`, {
    method: "POST",
    body: payload || {},
  })
}

export async function remindClientVariation(
  id: string,
  payload: { client_email: string; client_name?: string }
): Promise<VariationApi> {
  return apiRequest(`/commercial/variations/${id}/remind-client/`, {
    method: "POST",
    body: payload,
  })
}

export async function assignVariationUsers(id: string, assignedUserIds: string[]): Promise<VariationApi> {
  return apiRequest(`/commercial/variations/${id}/assign/`, {
    method: "POST",
    body: { assigned_user_ids: assignedUserIds },
  })
}

export async function toggleVariationSignature(id: string, approve: boolean): Promise<VariationApi> {
  return apiRequest(`/commercial/variations/${id}/toggle-signature/`, {
    method: "POST",
    body: { approve },
  })
}
