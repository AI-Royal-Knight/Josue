import Link from "next/link"
import { Eye, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"

export const metadata = {
  title: "Sign In",
}

export default function Page() {
  return (
    <AuthCard
      title="Sign in"
      className="text-slate-100"
      footer={
        <Link
          href="/forgot-password"
          className="text-xs text-slate-300 transition hover:text-white"
        >
          Forgot password?
        </Link>
      }
    >
      <div>
        <label className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            type="email"
            placeholder="Enter email"
            className="h-11 rounded-md border-white/30 bg-transparent pl-9 text-sm text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            type="password"
            placeholder="Enter password"
            className="h-11 rounded-md border-white/30 bg-transparent pl-9 text-sm text-white placeholder:text-slate-400"
          />
          <Eye className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <Button className="mt-2 h-11 w-full rounded-md text-sm font-semibold tracking-[0.2em] uppercase">
        Sign in
      </Button>
    </AuthCard>
  )
}
