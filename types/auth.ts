export type Role =
  | "project_admin"
  | "managing_director"
  | "project_director"
  | "procurement_department"
  | "commercial_department"
  | "document_controller"
  | "finance_department"
  | "contracts_manager"
  | "managers"
  | "supervisor"

export interface AuthUser {
  id: string
  name: string
  surname: string
  email: string
  role: Role
  projects?: string[]
  createdAt: Date
}
