import { Card, CardContent } from "@/components/ui/card"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TableStat from "@/components/common/table-stat"

type BreakdownRow = {
  period: string
  applicationValue: number
  projectValue: number
  labourTarget: number
  overspend: number
  unclaimed: number
  moneyOnHold: number
  poCalledOff: number
  loadingAndClearing: number
  managementPrelims: number
  plantHire: number
  proformaNR: number
  proformaNRMaterialEstimate: number
  variationValue: number
  variationLabourValue: number
  variationLabourTarget: number
  variationPoCalledOff: number
  variationClaimed: number
}

const data: BreakdownRow[] = [
  {
    period: "January",
    applicationValue: 100000,
    projectValue: 100000,
    labourTarget: 25000,
    overspend: 40000,
    unclaimed: 1500,
    moneyOnHold: 2000,
    poCalledOff: 3000,
    loadingAndClearing: 5000,
    managementPrelims: 2000,
    plantHire: 3000,
    proformaNR: 4000,
    proformaNRMaterialEstimate: 3500,
    variationValue: 5000,
    variationLabourValue: 2000,
    variationLabourTarget: 1500,
    variationPoCalledOff: 1000,
    variationClaimed: 2500,
  },
  {
    period: "February",
    applicationValue: 120000,
    projectValue: 120000,
    labourTarget: 28000,
    overspend: 45000,
    unclaimed: 1500,
    moneyOnHold: 2000,
    poCalledOff: 3000,
    loadingAndClearing: 5000,
    managementPrelims: 2000,
    plantHire: 3000,
    proformaNR: 4000,
    proformaNRMaterialEstimate: 3500,
    variationValue: 5000,
    variationLabourValue: 2000,
    variationLabourTarget: 1500,
    variationPoCalledOff: 1000,
    variationClaimed: 2500,
  },
  {
    period: "March",
    applicationValue: 140000,
    projectValue: 130000,
    labourTarget: 30000,
    overspend: 50000,
    unclaimed: 1500,
    moneyOnHold: 2000,
    poCalledOff: 3000,
    loadingAndClearing: 5000,
    managementPrelims: 2000,
    plantHire: 3000,
    proformaNR: 4000,
    proformaNRMaterialEstimate: 3500,
    variationValue: 5000,
    variationLabourValue: 2000,
    variationLabourTarget: 1500,
    variationPoCalledOff: 1000,
    variationClaimed: 2500,
  },
  {
    period: "April",
    applicationValue: 140000,
    projectValue: 130000,
    labourTarget: 30000,
    overspend: 50000,
    unclaimed: 1500,
    moneyOnHold: 2000,
    poCalledOff: 3000,
    loadingAndClearing: 5000,
    managementPrelims: 2000,
    plantHire: 3000,
    proformaNR: 4000,
    proformaNRMaterialEstimate: 3500,
    variationValue: 5000,
    variationLabourValue: 2000,
    variationLabourTarget: 1500,
    variationPoCalledOff: 1000,
    variationClaimed: 2500,
  },
]

const columns: ColDef<BreakdownRow>[] = [
  { headerName: "Date 15th to 15th", field: "period" },
  { headerName: "Application Value", field: "applicationValue" },
  { headerName: "Project Value", field: "projectValue" },
  { headerName: "Labour Target", field: "labourTarget" },
  { headerName: "Overspend", field: "overspend" },
  { headerName: "Unclaimed", field: "unclaimed" },
  { headerName: "Money on Hold", field: "moneyOnHold" },
  { headerName: "PO Called off", field: "poCalledOff" },
  { headerName: "Loading and clearing", field: "loadingAndClearing" },
  { headerName: "Management prelims", field: "managementPrelims" },
  { headerName: "Plant Hire", field: "plantHire" },
  { headerName: "Proforma NR", field: "proformaNR" },
  {
    headerName: "Proforma NR Material Estimate",
    field: "proformaNRMaterialEstimate",
  },
  { headerName: "Variation Value", field: "variationValue" },
  { headerName: "Variation Labour Value", field: "variationLabourValue" },
  { headerName: "Variation Labour Target", field: "variationLabourTarget" },
  { headerName: "Variation PO Called Off", field: "variationPoCalledOff" },
  { headerName: "Variation Claimed", field: "variationClaimed" },
]

export default function Page() {
  return (
    <div className="w-full p-6">
      <h2 className="mb-4">Project Overview</h2>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Select>
            <SelectTrigger className="w-[240px] border-white/10 bg-slate-900">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="project-a">
                Riverside Tower Development
              </SelectItem>
              <SelectItem value="project-b">Project B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">
            Riverside Tower Development
          </h2>
          <p className="text-sm text-muted-foreground">
            RT-2024-001 • 123 Thames Street, London
          </p>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
      </div> */}
      <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:justify-start">
        <TableStat
          summaryRows={[
            { label: "Project Value", value: "£1,000,000" },
            { label: "Material Estimate", value: "£300" },
            { label: "Labour Estimate", value: "£320" },
            { label: "Prelims Estimate", value: "£50,000" },
            { label: "Estimate Profit", value: "£150,000" },
          ]}
        />
        <TableStat
          summaryRows={[
            { label: "Total PO Raised", value: "£1,000,000" },
            { label: "Total Variation PO Raised", value: "£300" },
            { label: "Proforma NR", value: "£320" },
            { label: "Proforma NR Material Estimate", value: "£50,000" },
            { label: "Total Unclaimed", value: "£150,000" },
            { label: "Total Overspend", value: "£150,000" },
          ]}
        />
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-medium">Financial Breakdown</h3>
        <AgTable
          rowData={data}
          columnDefs={columns}
          height="auto"
          defaultColDef={{
            minWidth: 160,
          }}
        />
      </div>
    </div>
  )
}
