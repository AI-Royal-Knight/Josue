import type { ColumnDef } from "@tanstack/react-table"

import { DynamicTable } from "@/components/dynamic-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TableStat from "@/components/common/table-stat"

type DailyRegisterRow = {
  no: number
  name: string
  surname: string
  project: string
  date: string
  clockInTime: string
  clockInGps: string
  clockOut: string
  clockOutGps: string
  profession: string
  management: string
}

const summaryRows = [
  { label: "Todays Clock In Users", value: "1000" },
  { label: "Todays Clock out Users", value: "400" },
  { label: "This Weeks Users", value: "200" },
  { label: "This Months Users", value: "200" },
]

const rows: DailyRegisterRow[] = [
  {
    no: 1,
    name: "Alex watson",
    surname: "",
    project: "",
    date: "",
    clockInTime: "",
    clockInGps: "",
    clockOut: "",
    clockOutGps: "",
    profession: "",
    management: "",
  },
  {
    no: 2,
    name: "Watson Wanches",
    surname: "",
    project: "",
    date: "",
    clockInTime: "",
    clockInGps: "",
    clockOut: "",
    clockOutGps: "",
    profession: "",
    management: "",
  },
  {
    no: 3,
    name: "Lipo Lion",
    surname: "",
    project: "",
    date: "",
    clockInTime: "",
    clockInGps: "",
    clockOut: "",
    clockOutGps: "",
    profession: "",
    management: "",
  },
  {
    no: 4,
    name: "Chaikeo",
    surname: "",
    project: "",
    date: "",
    clockInTime: "",
    clockInGps: "",
    clockOut: "",
    clockOutGps: "",
    profession: "",
    management: "",
  },
]

const columns: ColumnDef<DailyRegisterRow>[] = [
  { accessorKey: "no", header: "No." },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "surname", header: "Sure name" },
  { accessorKey: "project", header: "Project" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "clockInTime", header: "Clock in Time" },
  { accessorKey: "clockInGps", header: "Clock in GPS" },
  { accessorKey: "clockOut", header: "Clock out" },
  { accessorKey: "clockOutGps", header: "Clock out GPS" },
  { accessorKey: "profession", header: "Profession" },
  { accessorKey: "management", header: "Management" },
]

export default function Page() {
  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Daily Register</h1>

      <div className="max-w-[420px] space-y-2">
        <p className="text-sm font-medium">Select Project</p>
        <Select defaultValue="project-a">
          <SelectTrigger className="bg-[#1a2842]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="project-a">Project A</SelectItem>
            <SelectItem value="project-b">Project B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TableStat summaryRows={summaryRows} />

      <DynamicTable columns={columns} data={rows} initialSortId="no" />
    </div>
  )
}
