import DynamicTable from "@/components/tanstack-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { projectAmins } from "@/constants/project-admins"

export default function Page() {
  return (
    <div className="w-full min-w-0 p-4 md:p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Project Admins</CardTitle>
          <CardDescription>
            A resizable table that stretches to the available viewport width on
            load and on window resize.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <DynamicTable tableData={projectAmins} />
        </CardContent>
      </Card>
    </div>
  )
}
