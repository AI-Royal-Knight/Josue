import { apiRequest } from "./client"

export type RAMS = {
  id: string
  project: string
  project_name: string
  title: string
  date: string
  review_date: string | null
  document_url: string | null
  signed_document_url: string | null
  completed_at: string | null
}

export type DailyBriefing = {
  id: string
  project: string
  project_name: string
  title: string
  date: string
  document_url: string | null
  signed_document_url: string | null
  completed_at: string | null
}

export type ToolboxTalk = {
  id: string
  project: string
  project_name: string
  title: string
  date: string
  document_url: string | null
  signed_document_url: string | null
  completed_at: string | null
}

export type ToDoList = {
  id: string
  project: string
  project_name: string
  title: string
  date: string
  completion_date: string | null
  assign_user: string | null
  signed_document_url: string | null
  completed_at: string | null
}

export type OperationsData = {
  rams: RAMS[]
  briefings: DailyBriefing[]
  toolbox_talks: ToolboxTalk[]
  todos: ToDoList[]
}

export async function getOperations(projectId: string): Promise<OperationsData> {
  return apiRequest(`/employee/operations/?project_id=${projectId}`, {
    method: "GET",
  })
}

export async function createRAMS(data: FormData): Promise<RAMS> {
  return apiRequest("/employee/operations/rams/create/", {
    method: "POST",
    body: data,
  })
}

export async function createDailyBriefing(data: FormData): Promise<DailyBriefing> {
  return apiRequest("/employee/operations/briefings/create/", {
    method: "POST",
    body: data,
  })
}

export async function createToolboxTalk(data: FormData): Promise<ToolboxTalk> {
  return apiRequest("/employee/operations/toolbox-talks/create/", {
    method: "POST",
    body: data,
  })
}

export async function createToDo(data: object): Promise<ToDoList> {
  return apiRequest("/employee/operations/todos/create/", {
    method: "POST",
    body: data,
  })
}

export type EmployeeOption = {
  id: string
  name: string
}

export async function getCompanyEmployees(): Promise<{ users: EmployeeOption[] }> {
  return apiRequest("/employee/company-employees/", {
    method: "GET",
  })
}
