import { apiRequest } from "./client"

export type ChatMessage = {
  id: string
  author_name: string
  author_role: string
  text: string
  attachments: { name: string; url: string }[]
  created_at: string
}

export type RFI = {
  id: string
  rfi_number: string
  project_name: string
  description: string
  trade: string
  status: "OPEN" | "CLOSED"
  document_url: string | null
  created_at: string
  closed_at: string | null
  created_by_name: string
  messages: ChatMessage[]
}

export async function getRFIs(): Promise<RFI[]> {
  const res = await apiRequest<{ rfis: RFI[] }>("/project-admin/rfis/")
  return res.rfis
}

export async function closeRFI(id: string): Promise<RFI> {
  return await apiRequest<RFI>(`/project-admin/rfis/${id}/close/`, { method: "PATCH" })
}

export async function sendRFIMessage(id: string, text: string, files: File[]): Promise<ChatMessage> {
  const formData = new FormData()
  formData.append("text", text)
  if (files && files.length > 0) {
    formData.append("attachment", files[0]) // Just supporting one attachment for now
  }
  
  return await apiRequest<ChatMessage>(`/project-admin/rfis/${id}/messages/`, {
    method: "POST",
    body: formData
  })
}
