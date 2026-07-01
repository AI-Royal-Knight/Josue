"use client"

import { useEffect, useState } from "react"
import TableStat from "@/components/common/table-stat"
import { adminApi, AdminHomeData } from "@/lib/api/admin"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function Page() {
  const [data, setData] = useState<AdminHomeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await adminApi.getHomeData()
        setData(response)
      } catch (error: any) {
        toast.error(error.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-2/3 space-y-6 p-6">
      <h1 className="text-xl font-semibold">Welcome to Admin Dashboard</h1>
      <p>
        Select a section from the sidebar to manage users, project
        administrators, and system settings. All data is presented in a
        structured, spreadsheet-like format for quick editing and review.{" "}
      </p>

      <div className="flex gap-6">
         <TableStat summaryRows={[
         { label: "Total Users", value: data?.total_users?.toString() || "0" },
         { label: "Active Projects", value: data?.active_projects?.toString() || "0" },
      ]} />
      </div>
    </div>
  )
}
