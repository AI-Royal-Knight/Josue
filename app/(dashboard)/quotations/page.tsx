import { AgTable } from "@/components/common/AgTable"
import SupplierForm from "@/app/supplier/_components/SupplierForm"
import type { ColDef } from "ag-grid-community"

type QuoteItem = {
  id: number
  description: string
  qty: string
  discount: string
  per: string
  each: string
  totalValue: string
  comments: string
}

const createRow = (id: number): QuoteItem => ({
  id,
  description: "Paste from Excel sheet",
  qty: "QTY",
  discount: "0.00",
  per: "Unit",
  each: "0.00",
  totalValue: "$",
  comments: "Supplier comments",
})

const rowsData: QuoteItem[] = [
  createRow(1),
  createRow(2),
  createRow(3),
  createRow(4),
  createRow(5),
  createRow(6),
  createRow(7),
  createRow(8),
]

export default function Page() {
  const columnDefs: ColDef<QuoteItem>[] = [
    { headerName: "Description", field: "description" },
    { headerName: "QTY", field: "qty" },
    { headerName: "Discount", field: "discount" },
    { headerName: "Per", field: "per" },
    { headerName: "Each", field: "each" },
    { headerName: "Total Value", field: "totalValue" },
    { headerName: "Comments", field: "comments" },
  ]

  return (
    <div className="w-full min-w-0 space-y-8 p-6">

   <div className="max-w-4xl">

      <SupplierForm />
   </div>

      <AgTable rowData={rowsData} columnDefs={columnDefs} />

    </div>
  )
}
