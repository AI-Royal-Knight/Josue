import DynamicTable from "@/components/tanstack-table"
import { Button } from "@/components/ui/button"
import { projectAmins } from "@/constants/project-admins"
import InviteDialog from "@/components/invite-dialog"
import { Download } from "lucide-react"

export default function page() {
  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="flex justify-end gap-6 p-6">
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
