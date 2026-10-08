import { apiRequest } from "./client"

export interface ProfileResponse {
  id: number
  email: string
  backup_email: string | null
  first_name: string
  last_name: string
  role: string
  profile: {
    cscs_card_no?: string | null
    cscs_expiry_date?: string | null
    ipaf_certification?: string | null
    pasma_certification?: string | null
    sssts_smsts?: string | null
    profession?: string | null
    emergency_contact_name?: string | null
    emergency_contact_number?: string | null
    categories?: string | null
    insurance_policy?: string | null
    employer_liability?: string | null
    terms_accepted?: boolean
    digital_signature?: string | null
  } | null
  company: {
    id?: number
    company_name?: string | null
    company_logo?: string | null
    company_number?: number | null
    building_number?: number | null
    street?: string | null
    town?: string | null
    city?: string | null
    postcode?: string | null
    vat_number?: string | null
    phone?: string | null
    utr?: string | null
    bank_name?: string | null
    bank_address?: string | null
    sort_code?: string | null
    account_number?: string | null
    iban?: string | null
    swift_bic?: string | null
    public_liability_policy?: string | null
    public_liability_expiry?: string | null
    public_liability_document?: string | null
    employers_liability_policy?: string | null
    employers_liability_expiry?: string | null
    employers_liability_document?: string | null
    attachment?: string | null
    terms_and_conditions_document?: string | null
  } | null
}

export type ProfileUpdateRequest = Partial<Omit<ProfileResponse, 'id' | 'role'>>

export async function getProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/account/profile/")
}

export async function updateProfile(data: ProfileUpdateRequest | FormData): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>("/account/profile/", {
    method: "PUT",
    body: data,
  })
}
