"use client"

import { useState, Suspense } from "react"
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"
import { apiRequest, ApiError } from "@/lib/api/client"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const uid = searchParams.get("uid")
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) return

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." })
      return
    }

    if (!uid || !token) {
      setMessage({ type: "error", text: "Invalid or missing reset token." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await apiRequest<{ success: boolean; message: string }>("/account/reset-password/", {
        method: "POST",
        public: true,
        body: { uid, token, new_password: password },
      })
      setMessage({ type: "success", text: "Password has been successfully reset. Redirecting to login..." })
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/sign-in")
      }, 2000)

    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "An unexpected error occurred."
      setMessage({ type: "error", text: msg })
    } finally {
      setLoading(false)
    }
  }

  if (!uid || !token) {
    return (
      <div className="text-center text-sm text-slate-300">
        <p className="mb-4">Invalid or missing password reset link.</p>
        <Link href="/forgot-password" className="text-blue-400 hover:underline">
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="h-11 rounded-md border-white/30 bg-transparent pr-10 pl-9 text-sm text-white placeholder:text-slate-400"
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="h-11 rounded-md border-white/30 bg-transparent pr-10 pl-9 text-sm text-white placeholder:text-slate-400"
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
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
        disabled={loading || !password || !confirmPassword}
        className="mt-2 h-11 w-full rounded-md text-sm font-semibold tracking-[0.2em] uppercase"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
      </Button>
    </form>
  )
}

export default function Page() {
  return (
    <AuthCard title="Reset Password" subtitle="Enter your new password below">
      <Suspense fallback={<div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
