import { Card, CardContent } from "@/components/ui/card"
import { DynamicTable } from "@/components/dynamic-table"
import type { ColumnDef } from "@tanstack/react-table"

type BreakdownRow = {
  period: string
  applicationValue: number
  projectValue: number
  labourTarget: number
  overspend: number
  unclaimed: number
  poCalledOff: number
}

const data: BreakdownRow[] = [
  {
    period: "January",
    applicationValue: 100000,
    projectValue: 100000,
    labourTarget: 25000,
    overspend: 40000,
    unclaimed: 1500,
    poCalledOff: 3000,
  },
  {
    period: "February",
    applicationValue: 120000,
    projectValue: 120000,
    labourTarget: 28000,
    overspend: 45000,
    unclaimed: 1500,
    poCalledOff: 3000,
  },
  {
    period: "March",
    applicationValue: 140000,
    projectValue: 130000,
    labourTarget: 30000,
    overspend: 50000,
    unclaimed: 1500,
    poCalledOff: 3000,
  },
  {
    period: "April",
    applicationValue: 140000,
    projectValue: 130000,
    labourTarget: 30000,
    overspend: 50000,
    unclaimed: 1500,
    poCalledOff: 3000,
  },
]

const columns: ColumnDef<BreakdownRow>[] = [
  { accessorKey: "period", header: "Date 15th to 15th" },
  { accessorKey: "applicationValue", header: "Application Value" },
  { accessorKey: "projectValue", header: "Project Value" },
  { accessorKey: "labourTarget", header: "Labour Target" },
  { accessorKey: "overspend", header: "Overspend" },
  { accessorKey: "unclaimed", header: "Unclaimed" },
  { accessorKey: "poCalledOff", header: "PO Called off" },
]

export default function Page() {
  return (
    <div className="w-full p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Riverside Tower Development</h2>
        <p className="text-sm text-muted-foreground">
          RT-2024-001 • 123 Thames Street, London
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1">
          <CardContent>
            <div className="text-sm text-muted-foreground">Project Value</div>
            <div className="mt-2 font-semibold">1000</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent>
            <div className="text-sm text-muted-foreground">Total PO Raised</div>
            <div className="mt-2 font-semibold">300</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Total Variation PO Raised
            </div>
            <div className="mt-2 font-semibold">320</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-medium">Financial Breakdown</h3>
        <Card>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <DynamicTable
                columns={columns}
                data={data}
                initialSortId="period"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
