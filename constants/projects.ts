export type ProjectItem = {
  id: string
  projectName: string
  jobCode: string
  vatTemp: string
  address: string
  dateCreated: string
  projectValue: string
  startDate?: string
  completionDate?: string
  overdue?: string
  completed?: string
}

export const projects: ProjectItem[] = [
  {
    id: "1",
    projectName: "Riverside Tower Development",
    jobCode: "RT-2024-001",
    vatTemp: "123",
    address: "123 Thames Street, London",
    dateCreated: "2026-04-20",
    projectValue: "£54,156,415",
    startDate: "2028-12-10",
    completionDate: "2030-12-24",
    overdue: "",
    completed: "",
  },
]
