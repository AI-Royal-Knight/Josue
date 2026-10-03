"use client"
import { useState, useEffect, useCallback } from "react"
import { AgTable } from "@/components/common/AgTable"
import TableStat from "@/components/common/table-stat"
import { Switch } from "@/components/ui/switch"
import { ColDef } from "ag-grid-community"
import { format } from "date-fns"
import ConfirmPaymentDialog from "@/components/common/confirm-payment"

import { getAllInvoices, updateInvoicePayment, resendInvoice, type MonthlyInvoice } from "@/lib/api/super-admin"
import { getApiBaseUrl } from "@/lib/api/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ExportCsvButton } from "@/components/common/export-csv-button"
import { Button } from "@/components/ui/button"

type InvoiceRow = {
  id: string
  invoiceNumber: string
  companyName: string
  date: string
  value: string
  paid: boolean
  paymentDate: string
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
  }
}

export default function Page() {
  const [rows, setRows] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentConfirm, setPaymentConfirm] = useState<{ id: string; nextPaid: boolean; supplierName: string } | null>(null)

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
    cellRenderer: (params: { data?: InvoiceRow; value: string }) => {
      if (!params.data) return params.value

      const handleViewPdf = async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("tresta:accessToken") : null
        const url = `${getApiBaseUrl()}/super-admin/invoices/${params.data!.id}/pdf/`
        try {
          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          if (!res.ok) throw new Error(`Failed to load PDF (${res.status})`)
          const blob = await res.blob()
          const blobUrl = URL.createObjectURL(blob)
          window.open(blobUrl, "_blank")
        } catch (err) {
          console.error(err)
          toast.error("Failed to open invoice PDF")
        }
      }

      return (
        <button
          onClick={handleViewPdf}
          className={`${params.data?.paid ? "text-emerald-500" : "text-red-500"} hover:underline font-medium inline-flex h-full items-center cursor-pointer bg-transparent border-none p-0`}
        >
          {params.value}
        </button>
      )
    },
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
            onCheckedChange={(checked) => {
              const invoice = params.data
              if (!invoice) return

              setPaymentConfirm({
                id: invoice.id,
                nextPaid: checked,
                supplierName: invoice.companyName || "the company",
              })
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
    {
      headerName: "Actions",
      colId: "actions",
      sortable: false,
      filter: false,
      cellRenderer: (params: { data?: InvoiceRow }) => {
        if (!params.data) return null
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await resendInvoice(params.data!.id)
                toast.success("Invoice resent successfully")
              } catch (err) {
                toast.error("Failed to resend invoice")
              }
            }}
          >
            Resend
          </Button>
        )
      },
    },
  ]

  const totalInvoices = rows.length
  const confirmedCount = rows.filter(r => r.paid).length
  const outstandingCount = totalInvoices - confirmedCount

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1>Invoice List</h1>
          {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
        </div>
        <ExportCsvButton 
          fileName="invoices.csv"
          rows={rows}
          columns={columnDefs.map((col) => ({
            header: String(col.headerName),
            field: String(col.field || col.colId) as keyof InvoiceRow,
          }))}
        />
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

      <ConfirmPaymentDialog
        open={!!paymentConfirm}
        onOpenChange={(open) => {
          if (!open) setPaymentConfirm(null)
        }}
        supplierName={paymentConfirm?.supplierName || ""}
        nextPaid={paymentConfirm?.nextPaid || false}
        onConfirm={async () => {
          if (!paymentConfirm) return
          const { id, nextPaid } = paymentConfirm
          setPaymentConfirm(null)
          
          try {
            const updated = await updateInvoicePayment(id, nextPaid)
            setRows((currentRows) =>
              currentRows.map((row) =>
                row.id === id ? mapToInvoiceRow(updated) : row
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
  )
}
