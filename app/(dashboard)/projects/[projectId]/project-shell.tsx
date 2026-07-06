"use client"

import Link from "next/link"
import { useState, useEffect, type ReactNode } from "react"
import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProjectLayoutClient } from "./layout-client"
import { getProject } from "@/lib/api/project-admin"

type ProjectShellProps = {
  children: ReactNode
  projectId: string
  projectName: string
}

export function ProjectShell({
  children,
  projectId,
  projectName: initialProjectName,
}: ProjectShellProps) {
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [projectName, setProjectName] = useState(initialProjectName)

  useEffect(() => {
    async function fetchProject() {
      try {
        const project = await getProject(projectId)
        if (project && project.projectName) {
          setProjectName(project.projectName)
        }
      } catch (err) {
        console.error("Failed to fetch project:", err)
      }
    }
    fetchProject()
  }, [projectId])

  return (
    <div className="flex h-full min-h-screen w-full">
      {!sidebarHidden ? (
        <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 px-3 py-6">
          <Link
            href="/projects"
            className="mb-6 flex items-center gap-2 px-3 text-sm text-slate-400 transition-colors hover:text-slate-100"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Back to Project
          </Link>

          <ProjectLayoutClient projectId={projectId} />

          <div className="mt-auto px-3 pt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setSidebarHidden(true)}
            >
              Hide menu
            </Button>
          </div>
        </aside>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative flex items-center justify-center border-b border-white/10 px-6 py-1">
          <div className="absolute left-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={sidebarHidden ? "Show menu" : "Hide menu"}
              onClick={() => setSidebarHidden((prev) => !prev)}
            >
              {sidebarHidden ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="rounded-lg px-16 py-4 text-center">
            <h1 className="text-xl font-bold text-slate-100">
              {projectName} Dashboard
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">{children}</div>
      </div>
    </div>
  )
}
