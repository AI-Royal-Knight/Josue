import { use } from "react"
import { ProjectShell } from "./project-shell"

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const projectName = `Project ${projectId}`

  return (
    <ProjectShell projectId={projectId} projectName={projectName}>
      {children}
    </ProjectShell>
  )
}
