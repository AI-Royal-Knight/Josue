"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import type { ColDef } from "ag-grid-community"
import { AgTable } from "@/components/common/AgTable"
import SelectProject from "@/components/shared/select-project"
import { Button } from "@/components/ui/button"
import { getBucketItems, submitBucketItems } from "@/lib/api/user-invoices"
import type { UserInvoiceApi } from "@/types/api"

export default function BucketPage() {
  const [rows, setRows] = useState<UserInvoiceApi[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedInvoices, setSelectedInvoices] = useState<UserInvoiceApi[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Fetch bucket items when project changes
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getBucketItems(
        selectedProject && selectedProject !== "none"
          ? { project_id: selectedProject }
          : undefined
      )
      setRows(res.invoices)
    } catch (e) {
      console.error("Failed to load bucket items", e)
      toast.error("Failed to load bucket items")
    } finally {
      setLoading(false)
    }
  }, [selectedProject])

  useEffect(() => {
    load()
  }, [load])

  const colDefs = useMemo<ColDef<UserInvoiceApi>[]>(() => [
    {
      headerName: "No.",
      valueGetter: "node.rowIndex + 1",
      width: 80,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      pinned: "left",
    },
    { 
      headerName: "Source", 
      field: "sourceName",
      width: 150,
    },
    { 
      headerName: "Work Area", 
      field: "workArea",
      flex: 1,
    },
    { 
      headerName: "Description", 
      field: "description",
      flex: 2,
    },
    { 
      headerName: "Total", 
      field: "total",
      valueFormatter: (params) => {
        if (params.value == null) return ""
        return `£${Number(params.value).toLocaleString("en-GB", {
          minimumFractionDigits: 2,
        })}`
      },
    },
    { 
      headerName: "Date", 
      field: "date",
      width: 120,
    },
  ], [])

  const handleSubmit = async () => {
    if (selectedInvoices.length === 0) return
    setSubmitting(true)
    try {
      const ids = selectedInvoices.map((inv) => inv.id)
      const res = await submitBucketItems(ids)
      toast.success(res.message || "Submitted successfully!")
      // Clear selection and reload
      setSelectedInvoices([])
      await load()
    } catch (e) {
      console.error(e)
      toast.error("Failed to submit items")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-6 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-primary text-2xl font-semibold">Bucket List</h1>
        <div className="flex items-center gap-4">
          <SelectProject
            value={selectedProject}
            onValueChange={setSelectedProject}
            showAllOption
            className="w-[240px]"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || selectedInvoices.length === 0}
          >
            {submitting ? "Submitting..." : `Submit Selected (${selectedInvoices.length})`}
          </Button>
        </div>
      </div>

      <AgTable<UserInvoiceApi>
        rowData={rows}
        columnDefs={colDefs}
        loading={loading}
        noRowsText="Your bucket is empty"
        rowSelection="multiple"
        onSelectionChanged={setSelectedInvoices}
      />
    </div>
  )
}
