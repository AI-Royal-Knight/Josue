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
  created_by: string | null
  created_by_name: string
  lines: VariationLineApi[]
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
}

// ── API Functions ──────────────────────────────────────────────────────────

export async function getVariations(projectId?: string): Promise<{ variations: VariationApi[] }> {
  const url = projectId
    ? `/commercial/variations/?project_id=${projectId}`
    : `/commercial/variations/`
  return apiRequest(url)
}

export async function createVariation(data: CreateVariationPayload): Promise<VariationApi> {
  return apiRequest("/commercial/variations/", {
    method: "POST",
    body: data,
  })
}

export async function approveVariation(id: string, action: "approve" | "reject"): Promise<VariationApi> {
  return apiRequest(`/commercial/variations/${id}/approve/`, {
    method: "POST",
    body: { action },
  })
}

export async function submitVariationToClient(id: string): Promise<VariationApi> {
  return apiRequest(`/commercial/variations/${id}/submit-to-client/`, {
    method: "POST",
  })
}
