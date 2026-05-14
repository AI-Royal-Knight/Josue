import { Eye, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"

export const metadata = {
  title: "Reset Password",
}

export default function Page() {
  return (
    <AuthCard title="Reset Password">
      <div>
        <label className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            type="password"
            placeholder="Enter password"
            className="h-11 rounded-md border-white/30 bg-transparent pr-10 pl-9 text-sm text-white placeholder:text-slate-400"
          />
          <Eye className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            type="password"
            placeholder="Enter password"
            className="h-11 rounded-md border-white/30 bg-transparent pr-10 pl-9 text-sm text-white placeholder:text-slate-400"
          />
          <Eye className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <Button className="mt-2 h-11 w-full rounded-md text-sm font-semibold tracking-[0.2em] uppercase">
        Continue
      </Button>
    </AuthCard>
  )
}
