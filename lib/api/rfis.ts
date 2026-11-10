import { apiRequest } from "./client"

export type ChatMessage = {
  id: string
  author_name: string
  author_role: string
  text: string
  attachments: { name: string; url: string }[]
  document_url?: string | null
  created_at: string
}

export type RFI = {
  id: string
  rfi_number: string
  project: string
  project_name: string
  description: string
  trade: string
  status: "OPEN" | "CLOSED"
  document_url: string | null
  attachments?: { name: string; url: string }[]
  created_at: string
  closed_at: string | null
  created_by?: string | null
  created_by_name: string
  messages: ChatMessage[]
  assigned_to_technical_department: boolean
  can_close?: boolean
}

export async function getRFIs(): Promise<RFI[]> {
  const res = await apiRequest<{ rfis: RFI[] }>("/project-admin/rfis/")
  return res.rfis
}

export async function getRFIDetail(id: string): Promise<RFI> {
  return await apiRequest<RFI>(`/project-admin/rfis/${id}/`)
}

export async function closeRFI(id: string): Promise<RFI> {
  return await apiRequest<RFI>(`/project-admin/rfis/${id}/close/`, { method: "PATCH" })
}

export async function sendRFIMessage(
  id: string,
  text: string,
  files: File[],
  role?: string
): Promise<ChatMessage> {
  const formData = new FormData()
  formData.append("text", text)
  if (role) {
    formData.append("author_role", role)
    formData.append("role", role)
  }
  if (files && files.length > 0) {
    files.forEach((f) => {
      formData.append("files", f)
      formData.append("attachment", f)
      formData.append("document", f)
    })
  }
  
  return await apiRequest<ChatMessage>(`/project-admin/rfis/${id}/messages/`, {
    method: "POST",
    body: formData,
    headers: role ? { "X-Active-Role": role } : undefined
  })
}

export async function assignRFIToTechnical(id: string, assigned: boolean, role?: string): Promise<RFI> {
  return await apiRequest<RFI>(`/project-admin/rfis/${id}/assign-technical/`, {
    method: "PATCH",
    body: {
      assigned_to_technical_department: assigned,
      assigned: assigned
    },
    headers: role ? { "X-Active-Role": role } : undefined
  })
}

export async function createRFI(data: FormData): Promise<RFI> {
  return await apiRequest<RFI>("/project-admin/rfis/", {
    method: "POST",
    body: data
  })
}
