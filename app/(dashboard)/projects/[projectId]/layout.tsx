import { use } from "react"
import { projects } from "@/constants/projects"
import { ProjectShell } from "./project-shell"

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const project = projects.find((p) => p.id === projectId)
  const projectName = project?.projectName ?? `Project ${projectId}`

  return (
    <ProjectShell projectId={projectId} projectName={projectName}>
      {children}
    </ProjectShell>
  )
}
