import { apiRequest } from "./client"

export interface SendInvitationPayload {
  email: string
  role: string
}

export async function sendInvitation(payload: SendInvitationPayload): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>("/account/invitations/send/", {
    method: "POST",
    body: payload,
  })
}

export interface InvitationDetails {
  email: string
  role: string
  company_id: number | null
  project_id: number | null
}

export async function validateInvitation(token: string): Promise<InvitationDetails> {
  return apiRequest<InvitationDetails>(`/account/invitations/validate/${token}/`, {
    public: true,
  })
}

export async function acceptInvitation(payload: Record<string, unknown>): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("/account/invitations/accept/", {
    method: "POST",
    body: payload,
    public: true,
  })
}
