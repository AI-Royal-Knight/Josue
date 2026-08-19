"use client"
import { useState, useEffect, useCallback } from "react"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { Switch } from "@/components/ui/switch"
import { ColDef } from "ag-grid-community"
import { format } from "date-fns"

import { getAllInvoices, updateInvoicePayment, type MonthlyInvoice } from "@/lib/api/super-admin"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type InvoiceRow = {
  id: string
  invoiceNumber: string
  companyName: string
  date: string
  value: string
  paid: boolean
  paymentDate: string
  pdfUrl: string | null
}

function mapToInvoiceRow(inv: MonthlyInvoice): InvoiceRow {
  return {
    id: inv.id,
    invoiceNumber: inv.invoice_number || "N/A",
    companyName: inv.company_name || "Unknown",
    date: inv.created_at ? format(new Date(inv.created_at), "yyyy-MM-dd") : `${inv.year}-${String(inv.month).padStart(2, '0')}-01`,
    value: inv.amount ? `£${parseFloat(inv.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "£0.00",
    paid: inv.is_paid,
    paymentDate: inv.payment_date ? format(new Date(inv.payment_date), "yyyy-MM-dd") : "",
    pdfUrl: inv.pdf_file || null,
  }
}

export default function Page() {
  const [rows, setRows] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllInvoices()
      setRows(data.map(mapToInvoiceRow))
    } catch (err) {
      console.error(err)
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const columnDefs: ColDef<InvoiceRow>[] = [
    {
      field: "invoiceNumber",
      headerName: "Invoice Number",
      cellRenderer: (params: { data?: InvoiceRow; value: string }) => (
        <a
          href={params.data?.pdfUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`${params.data?.paid ? "text-emerald-500" : "text-red-500"} hover:underline font-medium inline-flex h-full items-center`}
          onClick={(event) => {
            if (!params.data?.pdfUrl) {
              event.preventDefault()
              toast.error("PDF not available for this invoice")
            }
          }}
        >
          {params.value}
        </a>
      ),
    },
    { field: "companyName", headerName: "Company" },
    { field: "date", headerName: "Date" },
    { field: "value", headerName: "Amount" },
    {
      field: "paid",
      headerName: "Paid",
      cellRenderer: (params: { data?: InvoiceRow; value: boolean }) => (
        <div className="flex h-full items-center">
          <Switch
            checked={Boolean(params.value)}
            onCheckedChange={async (checked) => {
              const invoice = params.data
              if (!invoice) return

              try {
                const updated = await updateInvoicePayment(invoice.id, checked)
                setRows((currentRows) =>
                  currentRows.map((row) =>
                    row.id === invoice.id ? mapToInvoiceRow(updated) : row
                  )
                )
                toast.success("Payment status updated")
              } catch (err) {
                console.error(err)
                toast.error("Failed to update payment status")
              }
            }}
          />
        </div>
      ),
      type: "",
      minWidth: 120,
      maxWidth: 140,
    },
    {
      field: "paymentDate",
      headerName: "Date of confirmed payment",
    },
  ]

  const totalInvoices = rows.length
  const confirmedCount = rows.filter(r => r.paid).length
  const outstandingCount = totalInvoices - confirmedCount

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Invoice List</h1>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>
      <TableStat
        summaryRows={[
          { label: "Invoices", qty: totalInvoices.toString(), value: totalInvoices.toString() },
          { label: "Confirmed Payments", qty: confirmedCount.toString(), value: confirmedCount.toString() },
          { label: "Outstanding Payments", qty: outstandingCount.toString(), value: outstandingCount.toString() },
        ]}
      />

      <AgTable
        rowData={rows}
        columnDefs={columnDefs}
        height="70vh"
        pagination
        pageSize={10}
      />
    </div>
  )
}
