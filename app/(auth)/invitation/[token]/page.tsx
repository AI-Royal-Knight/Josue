"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { validateCompanyInvitation, acceptCompanyInvitation, CompanyInvitationDetails } from "@/lib/api/super-admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthCard from "@/app/(auth)/_components/auth-card"
import { Loader2, ArrowRight } from "lucide-react"

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [details, setDetails] = useState<CompanyInvitationDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    async function loadInvitation() {
      try {
        const data = await validateCompanyInvitation(token)
        setDetails(data)
      } catch (err: any) {
        setError(err.message || "Invalid or expired invitation link.")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      loadInvitation()
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await acceptCompanyInvitation({
        token,
        password,
        confirm_password: confirmPassword
      })
      toast.success(response.message || "Account activated successfully! You can now log in.")
      router.push("/sign-in")
    } catch (err: any) {
      toast.error(err.message || "Failed to activate account.")
      setIsSubmitting(false)
    }
  }

  // Common input styling matching the auth system
  const inputClass = "h-12 rounded-xl border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
  const labelClass = "block text-xs font-semibold tracking-[0.15em] text-slate-300 uppercase transition-colors group-focus-within:text-blue-400 mb-1.5"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !details) {
    return (
      <AuthCard 
        title="Invalid Invitation" 
        subtitle={error || "This invitation link is invalid or has expired."}
      >
        <div className="pt-4">
          <Button 
            onClick={() => router.push("/sign-in")} 
            className="h-12 w-full rounded-xl bg-slate-800 text-sm font-semibold tracking-[0.2em] uppercase text-white shadow-sm transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500/30"
          >
            Go to Login
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard 
      title={`Welcome to ${details.company_name}`} 
      subtitle={`Hello ${details.first_name}, please set your password to activate your account.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="group">
          <label htmlFor="password" className={labelClass}>Password</label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        
        <div className="group">
          <label htmlFor="confirm_password" className={labelClass}>Confirm Password</label>
          <Input
            id="confirm_password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold tracking-[0.2em] uppercase text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Activate Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </AuthCard>
  )
}
