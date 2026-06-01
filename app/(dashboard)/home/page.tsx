"use client"

import TableStat from "@/components/common/table-stat"

export default function page() {
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
         { label: "Total Users", value: "1,234" },
         { label: "Active Projects", value: "56" },
      ]} />
      </div>
    </div>
  )
}
