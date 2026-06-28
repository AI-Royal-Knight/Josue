"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, RefreshCw } from "lucide-react"
import { formatDistanceToNowStrict } from "date-fns"
import TableStat from "@/components/common/table-stat"
import { Button } from "@/components/ui/button"
import { getSuperAdminOverview, type OverviewResponse } from "@/lib/api/super-admin"
import { ApiError } from "@/lib/api/client"

export default function SuperAdminOverview() {
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSuperAdminOverview()
      setData(res)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load overview data."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview Dashboard</h1>
          <p className="text-sm text-slate-400">
            System-wide metrics and activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <span className="text-sm text-slate-400">System Online</span>
        </div>
      </header>

      {/* Stats */}
      {loading && !data ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading stats…
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : data ? (
        <TableStat
          summaryRows={[
            {
              label: "Admin users",
              value: String(data.statistics.admin_users),
            },
            { label: "Users", value: String(data.statistics.users) },
          ]}
        />
      ) : null}

      {/* Recent Activity */}
      <section className="rounded-lg bg-card p-4">
        <h2 className="font-semibold">Recent System Activity</h2>
        {loading && !data ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading activity…
          </div>
        ) : data?.recent_activities?.length ? (
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {data.recent_activities.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between">
                <span>{activity.message}</span>
                <span className="text-xs text-slate-500">
                  {formatDistanceToNowStrict(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No recent activity.</p>
        )}
      </section>

      <section className="flex gap-4">
        <Link
          href="/super-admin/companies"
          className="rounded-md bg-primary px-4 py-2 text-white"
        >
          Manage Companies
        </Link>
        <Link
          href="/super-admin/accounts-overview"
          className="rounded-md bg-secondary px-4 py-2 text-white"
        >
          Accounts Overview
        </Link>
      </section>
    </div>
  )
}
