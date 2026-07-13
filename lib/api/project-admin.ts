import { apiRequest } from "./client"

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProjectUser {
  id: string
  name: string
  email?: string
  checked: boolean
}

export interface ProjectRoleData {
  role: string
  role_key: string
  users: ProjectUser[]
}

export interface AssignRolePayload {
  role_key: string
  user_ids: string[]
}

// ── API Functions ──────────────────────────────────────────────────────────

import type { ProjectItem } from "@/constants/projects"

export async function getProjects(): Promise<{ projects: ProjectItem[]; total_count: number }> {
  const data = await apiRequest<{ projects: any[]; total_count: number }>("/project-admin/projects/")
  return {
    ...data,
    projects: data.projects.map((p) => ({
      id: p.id,
      projectName: p.project_name,
      jobCode: p.job_code,
      vatRate: p.vat_rate,
      address: p.address,
      dateCreated: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '',
      projectValue: p.project_value ? `£${parseFloat(p.project_value).toLocaleString('en-GB')}` : '',
      materialEstimate: p.material_estimate ? `£${parseFloat(p.material_estimate).toLocaleString('en-GB')}` : '',
      labourEstimate: p.labour_estimate ? `£${parseFloat(p.labour_estimate).toLocaleString('en-GB')}` : '',
      prelimsEstimate: p.prelims_estimate ? `£${parseFloat(p.prelims_estimate).toLocaleString('en-GB')}` : '',
      estimateProfit: p.estimate_profit ? `£${parseFloat(p.estimate_profit).toLocaleString('en-GB')}` : '',
      startDate: p.start_date,
      completionDate: p.completion_date,
      overdue: p.is_overdue,
      completed: p.is_completed,
    })),
  }
}

export async function getProject(projectId: string): Promise<ProjectItem> {
  const p = await apiRequest<any>(`/project-admin/projects/${projectId}/`)
  return {
    id: p.id,
    projectName: p.project_name,
    jobCode: p.job_code,
    vatRate: p.vat_rate,
    address: p.address,
    dateCreated: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '',
    projectValue: p.project_value ? `£${parseFloat(p.project_value).toLocaleString('en-GB')}` : '',
    materialEstimate: p.material_estimate ? `£${parseFloat(p.material_estimate).toLocaleString('en-GB')}` : '',
    labourEstimate: p.labour_estimate ? `£${parseFloat(p.labour_estimate).toLocaleString('en-GB')}` : '',
    prelimsEstimate: p.prelims_estimate ? `£${parseFloat(p.prelims_estimate).toLocaleString('en-GB')}` : '',
    estimateProfit: p.estimate_profit ? `£${parseFloat(p.estimate_profit).toLocaleString('en-GB')}` : '',
    startDate: p.start_date,
    completionDate: p.completion_date,
    overdue: p.is_overdue,
    completed: p.is_completed,
  }
}

export async function createProject(payload: any): Promise<ProjectItem> {
  return apiRequest<ProjectItem>("/project-admin/projects/", {
    method: "POST",
    body: payload,
  })
}

export async function getMyProjects(): Promise<{ projects: ProjectItem[]; total_count: number }> {
  const data = await apiRequest<{ projects: any[]; total_count: number }>("/project-admin/my-projects/")
  return {
    ...data,
    projects: data.projects.map((p) => ({
      id: p.id,
      projectName: p.project_name,
      jobCode: p.job_code,
      vatRate: p.vat_rate,
      address: p.address,
      dateCreated: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '',
      projectValue: p.project_value ? `£${parseFloat(p.project_value).toLocaleString('en-GB')}` : '',
      materialEstimate: p.material_estimate ? `£${parseFloat(p.material_estimate).toLocaleString('en-GB')}` : '',
      labourEstimate: p.labour_estimate ? `£${parseFloat(p.labour_estimate).toLocaleString('en-GB')}` : '',
      prelimsEstimate: p.prelims_estimate ? `£${parseFloat(p.prelims_estimate).toLocaleString('en-GB')}` : '',
      estimateProfit: p.estimate_profit ? `£${parseFloat(p.estimate_profit).toLocaleString('en-GB')}` : '',
      startDate: p.start_date,
      completionDate: p.completion_date,
      overdue: p.is_overdue,
      completed: p.is_completed,
    })),
  }
}

export interface FinancialBreakdownRow {
  period: string
  applicationValue: number
  totalSpent?: number
  projectValue: number
  labourTarget: number
  overspend: number
  unclaimed: number
  moneyOnHold: number
  poCalledOff: number
  loadingAndClearing: number
  managementPrelims: number
  plantHire: number
  proformaNR: number
  proformaNRMaterialEstimate: number
  variationValue: number
  variationLabourValue: number
  variationLabourTarget: number
  variationPoCalledOff: number
  variationClaimed: number
}

export async function getProjectFinancialBreakdown(projectId: string): Promise<{ breakdown: FinancialBreakdownRow[] }> {
  return apiRequest<{ breakdown: FinancialBreakdownRow[] }>(`/project-admin/projects/${projectId}/financial-breakdown/`)
}

export async function getCompanyUsers(roleKey?: string): Promise<{ users: ProjectUser[] }> {
  const url = roleKey ? `/project-admin/users/?role=${roleKey}` : `/project-admin/users/`
  return apiRequest<{ users: ProjectUser[] }>(url)
}

export async function getProjectRoles(projectId: string): Promise<ProjectRoleData[]> {
  return apiRequest<ProjectRoleData[]>(`/project-admin/projects/${projectId}/roles/`)
}

export type SubfolderAssignment = {
  id?: string
  user: ProjectUser
  hide_labour_target: boolean
  is_management_assignment: boolean
}

export type SubfolderData = {
  id: string
  name: string
  project_value: string
  labour_target: string
  rows: any[]
  assignments: SubfolderAssignment[]
}

export type FolderData = {
  id: string
  name: string
  is_management: boolean
  subfolders: SubfolderData[]
}

export async function getProjectFolders(projectId: string): Promise<FolderData[]> {
  return apiRequest<FolderData[]>(`/project-admin/projects/${projectId}/folders/`)
}

export async function createProjectFolder(
  projectId: string,
  payload: { name: string; is_management?: boolean; subfolders?: any[] }
): Promise<FolderData[]> {
  return apiRequest<FolderData[]>(`/project-admin/projects/${projectId}/folders/`, {
    method: "POST",
    body: payload,
  })
}

export async function updateProjectFolders(
  projectId: string,
  folders: FolderData[]
): Promise<FolderData[]> {
  return apiRequest<FolderData[]>(`/project-admin/projects/${projectId}/folders/bulk-update/`, {
    method: "PUT",
    body: folders,
  })
}

export async function assignProjectRole(
  projectId: string,
  payload: AssignRolePayload
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/project-admin/projects/${projectId}/roles/`, {
    method: "POST",
    body: payload,
  })
}

export type ApprovalConfigurationData = {
  id?: string
  action_type: string
  condition_value: string
  required_roles: string
  toggle_states?: boolean[]
  is_active: boolean
}

export async function getApprovalConfigs(projectId: string): Promise<ApprovalConfigurationData[]> {
  return apiRequest<ApprovalConfigurationData[]>(`/project-admin/projects/${projectId}/approval-configs/`, {
    cache: "no-store"
  })
}

export async function updateApprovalConfigs(
  projectId: string,
  payload: ApprovalConfigurationData[]
): Promise<ApprovalConfigurationData[]> {
  return apiRequest<ApprovalConfigurationData[]>(`/project-admin/projects/${projectId}/approval-configs/`, {
    method: "PUT",
    body: payload,
    cache: "no-store",
  })
}

export type UserMinimalData = {
  id: string
  first_name: string
  last_name: string
  email: string
}

export type ProformaAccessData = {
  id: string
  user: UserMinimalData
  is_active: boolean
  created_at: string
}

export async function getProformaAccess(projectId: string): Promise<ProformaAccessData[]> {
  return apiRequest<ProformaAccessData[]>(`/project-admin/projects/${projectId}/proforma-access/`, {
    cache: "no-store"
  })
}

export async function assignProformaAccess(
  projectId: string,
  userIds: string[]
): Promise<ProformaAccessData[]> {
  return apiRequest<ProformaAccessData[]>(`/project-admin/projects/${projectId}/proforma-access/`, {
    method: "POST",
    body: { user_ids: userIds },
    cache: "no-store"
  })
}

export async function updateProformaAccess(
  projectId: string,
  accessId: string,
  isActive: boolean
): Promise<ProformaAccessData> {
  return apiRequest<ProformaAccessData>(`/project-admin/projects/${projectId}/proforma-access/${accessId}/`, {
    method: "PATCH",
    body: { is_active: isActive },
    cache: "no-store"
  })
}

export async function deleteProformaAccess(
  projectId: string,
  accessId: string
): Promise<void> {
  return apiRequest<void>(`/project-admin/projects/${projectId}/proforma-access/${accessId}/`, {
    method: "DELETE",
    cache: "no-store"
  })
}

export type LoadingClearingAccessData = {
  id: string
  user: UserMinimalData
  is_active: boolean
  created_at: string
}

export async function getLoadingClearingAccess(projectId: string): Promise<LoadingClearingAccessData[]> {
  return apiRequest<LoadingClearingAccessData[]>(`/project-admin/projects/${projectId}/loading-clearing-access/`, {
    cache: "no-store"
  })
}

export async function assignLoadingClearingAccess(
  projectId: string,
  userIds: string[]
): Promise<LoadingClearingAccessData[]> {
  return apiRequest<LoadingClearingAccessData[]>(`/project-admin/projects/${projectId}/loading-clearing-access/`, {
    method: "POST",
    body: { user_ids: userIds },
    cache: "no-store"
  })
}

export async function updateLoadingClearingAccess(
  projectId: string,
  accessId: string,
  isActive: boolean
): Promise<LoadingClearingAccessData> {
  return apiRequest<LoadingClearingAccessData>(`/project-admin/projects/${projectId}/loading-clearing-access/${accessId}/`, {
    method: "PATCH",
    body: { is_active: isActive },
    cache: "no-store"
  })
}

export async function deleteLoadingClearingAccess(
  projectId: string,
  accessId: string
): Promise<void> {
  return apiRequest<void>(`/project-admin/projects/${projectId}/loading-clearing-access/${accessId}/`, {
    method: "DELETE",
    cache: "no-store"
  })
}
