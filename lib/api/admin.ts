import { apiRequest } from "./client"

export interface AdminHomeData {
  total_users: number
  active_projects: number
}

export interface ProjectAdminData {
  id: number
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  date_joined: string
}

export interface ProjectAdminsResponse {
  project_admins: ProjectAdminData[]
  total_count: number
}

export interface InviteProjectAdminPayload {
  first_name: string
  last_name: string
  email: string
  project_ids?: string[]
}

export interface ProjectData {
  id: string
  project_name: string
}

export interface ManagingDirectorData {
  id: number
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  date_joined: string
}

export interface ManagingDirectorsResponse {
  managing_directors: ManagingDirectorData[]
  total_count: number
}

export interface InviteManagingDirectorPayload {
  first_name: string
  last_name: string
  email: string
}

export const adminApi = {
  getHomeData: () => apiRequest<AdminHomeData>("/admin/home/"),
  getProjectAdmins: () => apiRequest<ProjectAdminsResponse>("/admin/project-admins/"),
  getProjects: () => apiRequest<ProjectData[]>("/admin/projects/"),
  inviteProjectAdmin: (data: InviteProjectAdminPayload) =>
    apiRequest<{ message: string; user_id: number }>("/admin/project-admins/", {
      method: "POST",
      body: data,
    }),
  getManagingDirectors: () => apiRequest<ManagingDirectorsResponse>("/admin/managing-directors/"),
  inviteManagingDirector: (data: InviteManagingDirectorPayload) =>
    apiRequest<{ message: string; user_id: number }>("/admin/managing-directors/", {
      method: "POST",
      body: data,
    }),
}
