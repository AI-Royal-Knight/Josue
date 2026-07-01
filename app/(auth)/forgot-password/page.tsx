"use client"

import { useState } from "react"
import { Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"
import { apiRequest, ApiError } from "@/lib/api/client"

export default function Page() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await apiRequest<{ message: string }>("/account/forgot-password/", {
        method: "POST",
        public: true,
        body: { email },
      })
      setMessage({ type: "success", text: res.message })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "An unexpected error occurred."
      setMessage({ type: "error", text: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Forgot password" subtitle="Enter your email address">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="h-11 rounded-md border-white/30 bg-transparent pl-9 text-sm text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 text-sm ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !email}
          className="mt-2 h-11 w-full rounded-md text-sm font-semibold tracking-[0.2em] uppercase"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
        </Button>
      </form>
    </AuthCard>
  )
}

