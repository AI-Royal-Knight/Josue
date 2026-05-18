"use client"

import { useState } from "react"
import type { ColDef } from "ag-grid-community"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AgTable } from "@/components/common/AgTable"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import TableStat from "@/components/common/table-stat"

type CallOffRow = {
  poRef: string
  callOffRef: string
  project: string
  mainFolder: string
  subFolder: string
  variationRef: string
  supplierName: string
  supplierEmail: string
  no: string
  productDescription: string
  totalQty: string
  unit: string
  unitPrice: string
  qtyRemaining: string
  callOffQty: string
  callOffPrice: string
  callOffDate: string
  expectedDeliveryDate: string
  callOffBy: string
  approveBy: string
}

const summaryMetrics = [
  { label: "PO Value", value: "000000" },
  { label: "Call of Value", value: "000000" },
  { label: "Po Remaining", value: "000000" },
]

const data: CallOffRow[] = [
  {
    poRef: "PO-2023-001",
    callOffRef: "CO-001-A",
    project: "Project Alpha",
    mainFolder: "Structural",
    subFolder: "Steelwork",
    variationRef: "VAR-00",
    supplierName: "Acme Steel Co.",
    supplierEmail: "sales@acmesteel.com",
    no: "1",
    productDescription: "Universal Beam 203x133x25",
    totalQty: "100",
    unit: "EA",
    unitPrice: "£150.00",
    qtyRemaining: "80",
    callOffQty: "20",
    callOffPrice: "£3,000.00",
    callOffDate: "2023-10-15",
    expectedDeliveryDate: "2023-11-15",
    callOffBy: "John Smith",
    approveBy: "Manager",
  },
  {
    poRef: "PO-2023-001",
    callOffRef: "CO-001-B",
    project: "Project Alpha",
    mainFolder: "Structural",
    subFolder: "Steelwork",
    variationRef: "VAR-00",
    supplierName: "Acme Steel Co.",
    supplierEmail: "sales@acmesteel.com",
    no: "2",
    productDescription: "Universal Column 203x203x46",
    totalQty: "50",
    unit: "EA",
    unitPrice: "£225.00",
    qtyRemaining: "40",
    callOffQty: "10",
    callOffPrice: "£2,250.00",
    callOffDate: "2023-10-18",
    expectedDeliveryDate: "2023-11-20",
    callOffBy: "John Smith",
    approveBy: "Supervisor",
  },
  {
    poRef: "PO-2023-045",
    callOffRef: "CO-045-A",
    project: "Project Alpha",
    mainFolder: "Electrical",
    subFolder: "Cabling",
    variationRef: "VAR-01",
    supplierName: "VoltTech Supplies",
    supplierEmail: "orders@volttech.co.uk",
    no: "3",
    productDescription: "Armoured Cable 3 Core 2.5mm",
    totalQty: "1000",
    unit: "M",
    unitPrice: "£2.50",
    qtyRemaining: "500",
    callOffQty: "500",
    callOffPrice: "£1,250.00",
    callOffDate: "2023-10-12",
    expectedDeliveryDate: "2023-10-25",
    callOffBy: "James Wilson",
    approveBy: "Lead Electrician",
  },
  {
    poRef: "PO-2023-088",
    callOffRef: "CO-088-A",
    project: "Project Alpha",
    mainFolder: "Civils",
    subFolder: "Concrete",
    variationRef: "VAR-00",
    supplierName: "BuildMat Direct",
    supplierEmail: "dispatch@buildin.com",
    no: "4",
    productDescription: "Ready Mix Concrete C35",
    totalQty: "200",
    unit: "M3",
    unitPrice: "£110.00",
    qtyRemaining: "150",
    callOffQty: "50",
    callOffPrice: "£5,500.00",
    callOffDate: "2023-10-11",
    expectedDeliveryDate: "2023-10-12",
    callOffBy: "Site Manager",
    approveBy: "Safety Officer",
  },
  {
    poRef: "PO-2023-088",
    callOffRef: "CO-088-B",
    project: "Project Alpha",
    mainFolder: "Civils",
    subFolder: "Rebar",
    variationRef: "VAR-02",
    supplierName: "BuildMat Direct",
    supplierEmail: "dispatch@buildin.com",
    no: "5",
    productDescription: "High Tensile Rebar 16mm",
    totalQty: "5000",
    unit: "KG",
    unitPrice: "£0.85",
    qtyRemaining: "3000",
    callOffQty: "2000",
    callOffPrice: "£1,700.00",
    callOffDate: "2023-10-09",
    expectedDeliveryDate: "2023-10-11",
    callOffBy: "Concrete Lead",
    approveBy: "Area Manager",
  },
  {
    poRef: "PO-2023-102",
    callOffRef: "CO-102-A",
    project: "Project Alpha",
    mainFolder: "Fit Out",
    subFolder: "Partitions",
    variationRef: "VAR-00",
    supplierName: "InteriorPro",
    supplierEmail: "sales@interiorpro",
    no: "6",
    productDescription: "Plasterboard 12.5mm 2400x1200",
    totalQty: "400",
    unit: "EA",
    unitPrice: "£8.50",
    qtyRemaining: "400",
    callOffQty: "0",
    callOffPrice: "£0.00",
    callOffDate: "-",
    expectedDeliveryDate: "-",
    callOffBy: "-",
    approveBy: "-",
  },
  {
    poRef: "PO-2023-102",
    callOffRef: "CO-102-B",
    project: "Project Alpha",
    mainFolder: "Fit Out",
    subFolder: "Partitions",
    variationRef: "VAR-00",
    supplierName: "InteriorPro",
    supplierEmail: "sales@interiorpro",
    no: "7",
    productDescription: "Metal Stud 70mm x 3m",
    totalQty: "600",
    unit: "EA",
    unitPrice: "£4.20",
    qtyRemaining: "600",
    callOffQty: "0",
    callOffPrice: "£0.00",
    callOffDate: "-",
    expectedDeliveryDate: "-",
    callOffBy: "-",
    approveBy: "-",
  },
  {
    poRef: "PO-2023-115",
    callOffRef: "CO-115-A",
    project: "Project Alpha",
    mainFolder: "Plumbing",
    subFolder: "Pipes",
    variationRef: "VAR-03",
    supplierName: "AquaFlow Systems",
    supplierEmail: "orders@aquaflow",
    no: "8",
    productDescription: "Copper Tube 15mm x 3m",
    totalQty: "300",
    unit: "EA",
    unitPrice: "£12.00",
    qtyRemaining: "250",
    callOffQty: "50",
    callOffPrice: "£600.00",
    callOffDate: "2023-10-20",
    expectedDeliveryDate: "2023-10-28",
    callOffBy: "Plumbing Lead",
    approveBy: "Project Manager",
  },
]

const columns: ColDef<CallOffRow>[] = [
  { headerName: "PO Ref", field: "poRef" },
  { headerName: "Call Off Ref", field: "callOffRef" },
  { headerName: "Project", field: "project" },
  { headerName: "Main Folder", field: "mainFolder" },
  { headerName: "Sub Folder", field: "subFolder" },
  { headerName: "Variation Ref.", field: "variationRef" },
  { headerName: "Supplier Name", field: "supplierName" },
  { headerName: "Supplier Email Adds", field: "supplierEmail" },
  { headerName: "No.", field: "no" },
  { headerName: "Product Description", field: "productDescription" },
  { headerName: "Total QTY", field: "totalQty" },
  { headerName: "UNIT", field: "unit" },
  { headerName: "Unit Price", field: "unitPrice" },
  { headerName: "QTY Remaining", field: "qtyRemaining" },
  { headerName: "Call Off QTY", field: "callOffQty" },
  { headerName: "Call Off Price", field: "callOffPrice" },
  { headerName: "Call Off Date", field: "callOffDate" },
  { headerName: "Expected Delivery Date", field: "expectedDeliveryDate" },
  { headerName: "Call-off By", field: "callOffBy" },
  { headerName: "Approve By", field: "approveBy" },
]

export default function Page() {
  const [selectedProject, setSelectedProject] = useState("project-a")

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Call Off List</h2>
        <div className="max-w-xs">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Select Project
          </label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="border-white/10 bg-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900">
              <SelectItem value="project-a">Project A</SelectItem>
              <SelectItem value="project-b">Project B</SelectItem>
              <SelectItem value="project-c">Project C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TableStat summaryRows={summaryMetrics} />

      <div className="mt-8 overflow-x-auto">
        <AgTable rowData={data} columnDefs={columns} height="auto" />
      </div>
    </div>
  )
}
