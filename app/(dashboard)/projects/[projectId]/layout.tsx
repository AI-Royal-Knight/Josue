import Link from "next/link"
import { use } from "react"
import { ArrowLeftRight } from "lucide-react"
import { projects } from "@/constants/projects"
import { ProjectLayoutClient } from "./layout-client"

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
    <div className="flex h-full min-h-screen w-full">
      {/* Project sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 px-3 py-6">
        <Link
          href="/projects"
          className="mb-6 flex items-center gap-2 px-3 text-sm text-slate-400 transition-colors hover:text-slate-100"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Back to Project
        </Link>

        <ProjectLayoutClient projectId={projectId} />
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Project dashboard banner */}
        <div className="flex items-center justify-center border-b border-white/10 px-6 py-1">
          <div className="rounded-lg px-16 py-4 text-center">
            <h1 className="text-xl font-bold text-slate-100">
              {projectName} Dashboard
            </h1>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-x-auto">{children}</div>
      </div>
    </div>
  )
}
