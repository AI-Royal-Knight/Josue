import { apiRequest } from "./client"

export type DailyRegisterRow = {
  id: string
  name: string
  surname: string
  project_name: string
  date: string
  check_in_time: string
  check_in_lat: number | null
  check_in_long: number | null
  check_out_time: string | null
  check_out_lat: number | null
  check_out_long: number | null
  profession: string | null
  management: string | null
}

export async function getDailyRegister(projectId?: string): Promise<DailyRegisterRow[]> {
  const url = projectId && projectId !== "all" 
    ? `/employee/daily-register/?project_id=${projectId}` 
    : `/employee/daily-register/`
  
  return await apiRequest<DailyRegisterRow[]>(url)
}
