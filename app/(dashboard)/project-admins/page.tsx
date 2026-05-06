import DynamicTable from "@/components/tanstack-table"
import { Button } from "@/components/ui/button"
import { projectAmins } from "@/constants/project-admins"
import InviteDialog from "./_components/invite-dialog"
import { Download } from "lucide-react"

export default function page() {
  return (
    <>
      <div className="w-full overflow-x-auto min-w-0 px-4">
        <div className="flex justify-end gap-4 py-4">
          <InviteDialog />
          <Button variant={"outline"}>
            <Download />
            Export
          </Button>
        </div>
        <DynamicTable tableData={projectAmins} />
      </div>
    </>
  )
}
