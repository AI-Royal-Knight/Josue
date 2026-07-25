"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Loader2, ArrowLeft, MailCheck } from "lucide-react"
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

  if (message?.type === "success") {
    return (
      <AuthCard title="Check your inbox" subtitle="We sent a password reset link to your email.">
        <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10">
            <MailCheck className="h-10 w-10 text-blue-400" />
          </div>
          <p className="text-center text-sm text-slate-300">
            {message.text}
          </p>
          <Link href="/sign-in" className="w-full">
            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-slate-800 text-sm font-semibold tracking-[0.2em] uppercase text-white shadow-sm transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500/30"
            >
              Return to Login
            </Button>
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard 
      title="Forgot password" 
      subtitle="Enter your email address to receive a reset link"
      footer={
        <Link
          href="/sign-in"
          className="group flex items-center justify-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold tracking-[0.15em] text-slate-300 uppercase transition-colors group-focus-within:text-blue-400">
            Email
          </label>
          <div className="relative group/input">
            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-blue-400" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="h-12 rounded-xl border-white/20 bg-white/5 pl-10 text-sm text-white placeholder:text-slate-500 backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Server error */}
        {message?.type === "error" && (
          <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
            <div className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !email}
          className="mt-4 h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold tracking-[0.2em] uppercase text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
        </Button>
      </form>
    </AuthCard>
  )
}
