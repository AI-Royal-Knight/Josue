import { apiRequest } from "./client"

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProjectUser {
  id: string
  name: string
  checked: boolean
}

export interface ProjectRoleData {
  role: string
  role_key: string
  users: ProjectUser[]
}

export interface AssignRolePayload {
  role_key: string
  user_id: string
}

// ── API Functions ──────────────────────────────────────────────────────────

export async function getCompanyUsers(): Promise<{ users: ProjectUser[] }> {
  return apiRequest<{ users: ProjectUser[] }>("/project-admin/users/")
}

export async function getProjectRoles(projectId: string): Promise<ProjectRoleData[]> {
  return apiRequest<ProjectRoleData[]>(`/project-admin/projects/${projectId}/roles/`)
}

export type SubfolderAssignment = {
  id: string
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
  is_active: boolean
}

export async function getApprovalConfigs(projectId: string): Promise<ApprovalConfigurationData[]> {
  return apiRequest<ApprovalConfigurationData[]>(`/project-admin/projects/${projectId}/approval-configs/`)
}

export async function updateApprovalConfigs(
  projectId: string,
  payload: ApprovalConfigurationData[]
): Promise<ApprovalConfigurationData[]> {
  return apiRequest<ApprovalConfigurationData[]>(`/project-admin/projects/${projectId}/approval-configs/`, {
    method: "PUT",
    body: payload,
  })
}
