/**
 * Invitations API — validate token, send invite, accept invite.
 */
import { apiRequest } from "./client"

// ── Validate ──────────────────────────────────────────────────────────────────

export interface InvitationDetails {
  email: string
  role: string
  company_id: number | null
  project_id: number | null
  /** Human-readable company name returned from the serializer */
  company_name?: string
  /** Human-readable project name returned from the serializer */
  project_name?: string
}

export async function validateInvitationToken(
  token: string
): Promise<InvitationDetails> {
  return apiRequest<InvitationDetails>(
    `/account/invitations/validate/${token}/`,
    { public: true }
  )
}

// ── Send ──────────────────────────────────────────────────────────────────────

export interface SendInvitationPayload {
  email: string
  role: string
  company_id?: number
  project_id?: number
}

export interface SendInvitationResponse {
  success: boolean
  message: string
}

export async function sendInvitation(
  payload: SendInvitationPayload
): Promise<SendInvitationResponse> {
  return apiRequest<SendInvitationResponse>("/account/invitations/send/", {
    method: "POST",
    body: payload,
  })
}

// ── Accept (standard user) ────────────────────────────────────────────────────

export interface AcceptInvitationPayload {
  token: string
  first_name: string
  last_name: string
  password: string
  // Optional profile fields (standard user)
  profession?: string
  cscs_card_no?: string
  // Optional for admin/supplier
  company_name?: string
}

export interface AcceptInvitationResponse {
  success: boolean
}

export async function acceptInvitation(
  payload: AcceptInvitationPayload
): Promise<AcceptInvitationResponse> {
  return apiRequest<AcceptInvitationResponse>(
    "/account/invitations/accept/",
    {
      method: "POST",
      body: payload,
      public: true,
    }
  )
}
