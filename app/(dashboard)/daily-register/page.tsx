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

const columns: ColDef<DailyRegisterRow>[] = [
  { headerName: "No.", field: "no" },
  { headerName: "Name", field: "name" },
  { headerName: "Sure name", field: "surname" },
  { headerName: "Project", field: "project" },
  { headerName: "Date", field: "date" },
  { headerName: "Clock in Time", field: "clockInTime" },
  { headerName: "Clock in GPS", field: "clockInGps" },
  { headerName: "Clock out", field: "clockOut" },
  { headerName: "Clock out GPS", field: "clockOutGps" },
  { headerName: "Profession", field: "profession" },
  { headerName: "Management", field: "management" },
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

      <AgTable rowData={rows} columnDefs={columns} height="auto" />
    </div>
  )
}
