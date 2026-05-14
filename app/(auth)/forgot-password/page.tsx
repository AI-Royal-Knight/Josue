import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"

export const metadata = {
  title: "Forgot Password",
}

export default function Page() {
  return (
    <AuthCard title="Forgot password" subtitle="Enter your email address">
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

      <Button className="mt-2 h-11 w-full rounded-md text-sm font-semibold tracking-[0.2em] uppercase">
        Continue
      </Button>
    </AuthCard>
  )
}
