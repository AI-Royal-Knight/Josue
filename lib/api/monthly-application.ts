import { apiRequest } from "./client"

export type MonthlyApplicationApi = {
  id: string
  project: string
  application_number: number
  date: string
  ref_no: string
  retention_percentage: string
  discount_percentage: string
  contract_works_total: string
  variations_total: string
  amount_claimed: string
  client_certified_amount: string
}

export type WhiteCardGroup = {
  groupId: string
  headerName: string
  subfolders: {
    name: string
    project_value: number
  }[]
}

export async function getMonthlyApplications(projectId: string): Promise<{ monthly_applications: MonthlyApplicationApi[] }> {
  return apiRequest<{ monthly_applications: MonthlyApplicationApi[] }>(`/commercial/monthly-applications/?project_id=${projectId}`)
}

export async function createMonthlyApplication(data: { project_id: string, retention_percentage?: number, discount_percentage?: number }): Promise<MonthlyApplicationApi> {
  return apiRequest<MonthlyApplicationApi>("/commercial/monthly-applications/", {
    method: "POST",
    body: data,
  })
}

export async function getWhiteCard(projectId: string): Promise<{ groups: WhiteCardGroup[] }> {
  return apiRequest<{ groups: WhiteCardGroup[] }>(`/commercial/white-card/?project_id=${projectId}`)
}
