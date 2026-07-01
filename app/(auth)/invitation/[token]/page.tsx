"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { validateCompanyInvitation, acceptCompanyInvitation, CompanyInvitationDetails } from "@/lib/api/super-admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !details) {
    return (
      <Card className="w-full max-w-md bg-[#182235]/60 border-[#2b3c5a] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white">Invalid Invitation</CardTitle>
          <CardDescription className="text-[#94a3b8]">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/login")} className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md bg-[#182235]/60 border-[#2b3c5a] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-white">Welcome to {details.company_name}</CardTitle>
        <CardDescription className="text-[#94a3b8]">
          Hello {details.first_name}, please set your password to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0b1018]/50 border-[#2b3c5a] text-white placeholder:text-muted-foreground"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-white">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#0b1018]/50 border-[#2b3c5a] text-white placeholder:text-muted-foreground"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activate Account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
