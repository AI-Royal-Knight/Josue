import { use } from "react"
import UpdateProjectForm from "./_components/update-project-form"

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)

  return (
    <div className="w-full p-6">
      <h2 className="mb-6 text-xl font-semibold text-slate-100">
        Project Details
      </h2>
      <UpdateProjectForm projectId={projectId} />
    </div>
  )
}
