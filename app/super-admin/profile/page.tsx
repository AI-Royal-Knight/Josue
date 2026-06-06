import { Card, CardContent } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Super Admin Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">Basic Information</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-slate-400">First Name</label>
                <p className="mt-1 text-sm text-slate-100">Alexander</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Surname</label>
                <p className="mt-1 text-sm text-slate-100">Wright</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Email Address</label>
                <p className="mt-1 text-sm text-slate-100">
                  alexander.wright@example.com
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Backup Email Address</label>
                <p className="mt-1 text-sm text-slate-100">
                  alexander2.wright@example.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
