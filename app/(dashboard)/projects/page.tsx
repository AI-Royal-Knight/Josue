import { DynamicTable } from "@/components/dynamic-table"
import { projects } from "@/constants/projects"
import CreateProjectDialog from "./_components/create-project-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  const columns = [
    { accessorKey: "projectName", header: "Project Name" },
    { accessorKey: "jobCode", header: "Job Code" },
    { accessorKey: "vatTemp", header: "VAT/Temp" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "dateCreated", header: "Date Created" },
    { accessorKey: "projectValue", header: "Project Value" },
    { accessorKey: "startDate", header: "Start Date" },
    { accessorKey: "completionDate", header: "Completion Date" },
    { accessorKey: "overdue", header: "Overdue" },
    { accessorKey: "completed", header: "Completed" },
  ]

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h2>Projects</h2>
        <CreateProjectDialog />
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="sr-only">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <DynamicTable columns={columns} data={projects} initialSortId="projectName" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
