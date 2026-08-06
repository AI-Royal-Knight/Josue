"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SubmitApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Collect form data
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())
    
    // Add checkboxes which might not be in FormData if unchecked, or we handle them specially
    const termsCheckbox = (e.target as HTMLFormElement).querySelector('#terms') as HTMLInputElement
    data.terms_accepted = termsCheckbox.checked ? "true" : "false"

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/account/submit-application/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit application")
      }

      toast.success("Application submitted successfully!", {
        description: "An admin or document controller will review your request.",
      })
      router.push("/sign-in") 
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "An unexpected error occurred.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Submit Application</h1>
        <p className="text-sm text-muted-foreground">
          Request a role by filling out your professional and company details. 
          Your application will be reviewed by an admin or document controller.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Role Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <h2 className="font-semibold text-white">Role Request</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="role">Requested Role <span className="text-red-500">*</span></Label>
                <select 
                  id="role" 
                  name="role"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="" disabled defaultValue="">Select a role...</option>
                  <option value="project_admin">Project Admin</option>
                  <option value="managing_director">Managing Director</option>
                  <option value="project_director">Project Director</option>
                  <option value="procurement_department">Procurement Department</option>
                  <option value="commercial_department">Commercial Department</option>
                  <option value="document_controller">Document Controller</option>
                  <option value="finance_department">Finance Department</option>
                  <option value="contracts_manager">Contracts Manager</option>
                  <option value="managers">Managers</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <h2 className="font-semibold text-white">Basic Information</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input id="firstName" name="first_name" required className="mt-1" placeholder="Alexander" />
              </div>
              <div>
                <Label htmlFor="surname">Surname <span className="text-red-500">*</span></Label>
                <Input id="surname" name="last_name" required className="mt-1" placeholder="Wright" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input id="email" name="email" type="email" required className="mt-1" placeholder="alexander.wright@example.com" />
              </div>
              <div>
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input id="password" name="password" type="password" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <h2 className="font-semibold text-white">Professional Details</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="categories">Second Categories</Label>
                <Input id="categories" name="categories" className="mt-1" placeholder="e.g. Electrical, Mechanical, Plumbing (comma separated)" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications & Compliance */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <h2 className="font-semibold text-white">Certifications & Compliance</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ipaf">IPAF Certificate</Label>
                  <Input id="ipaf" name="ipaf" className="mt-1" placeholder="e.g. IN-814644" />
                </div>
                <div>
                  <Label htmlFor="ipafExpiry">IPAF Expiry</Label>
                  <Input id="ipafExpiry" name="ipaf_expiry" type="date" className="mt-1" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="pasma">PASMA Certificate</Label>
                  <Input id="pasma" name="pasma" className="mt-1" placeholder="e.g. EN-25048" />
                </div>
                <div>
                  <Label htmlFor="pasmaExpiry">PASMA Expiry</Label>
                  <Input id="pasmaExpiry" name="pasma_expiry" type="date" className="mt-1" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="smsts">SSSTS / SMSTS</Label>
                  <Input id="smsts" name="smsts" className="mt-1" placeholder="e.g. SN-001708" />
                </div>
                <div>
                  <Label htmlFor="smstsExpiry">SSSTS / SMSTS Expiry</Label>
                  <Input id="smstsExpiry" name="smsts_expiry" type="date" className="mt-1" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cscs">CSCS / JCR / JIB</Label>
                  <Input id="cscs" name="cscs" className="mt-1" placeholder="e.g. SJ-SA1628" />
                </div>
                <div>
                  <Label htmlFor="cscsExpiry">CSCS Expiry</Label>
                  <Input id="cscsExpiry" name="cscs_expiry" type="date" className="mt-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <h2 className="font-semibold text-white">Company Information</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                <Input id="companyName" name="company_name" required className="mt-1" placeholder="Wright Construction Ltd" />
              </div>
              <div>
                <Label htmlFor="houseNumber">Company House Number</Label>
                <Input id="houseNumber" name="company_house_number" className="mt-1" placeholder="10348978" />
              </div>
              <div>
                <Label htmlFor="utr">Company UTR</Label>
                <Input id="utr" name="company_utr" className="mt-1" placeholder="DESC182101" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <h2 className="font-semibold text-white">Bank Details</h2>
            </div>
            <div className="mb-4 rounded border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              ✓ Secure Details: Bank information is encrypted and stored securely.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="bankName">Bank Name <span className="text-red-500">*</span></Label>
                <Input id="bankName" name="bank_name" required className="mt-1" placeholder="Barclays Bank PLC" />
              </div>
              <div>
                <Label htmlFor="accountName">Account Holder Name <span className="text-red-500">*</span></Label>
                <Input id="accountName" name="account_name" required className="mt-1" placeholder="Alexander Wright" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bankAddress">Bank Address</Label>
                <Input id="bankAddress" name="bank_address" className="mt-1" placeholder="1 Churchill Place, London, E14 5HP" />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number <span className="text-red-500">*</span></Label>
                <Input id="accountNumber" name="account_number" required className="mt-1" placeholder="•••• •••• 6049" />
              </div>
              <div>
                <Label htmlFor="sortCode">Sort Code <span className="text-red-500">*</span></Label>
                <Input id="sortCode" name="sort_code" required className="mt-1" placeholder="••-•• 49" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance & Address */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <h2 className="font-semibold text-white">Insurance & Address</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-white text-sm">Insurance Policies</h3>
                <div>
                  <Label htmlFor="insurancePolicy">Insurance Policy Number</Label>
                  <Input id="insurancePolicy" name="insurance_policy" className="mt-1" placeholder="PL-387824321" />
                </div>
                <div>
                  <Label htmlFor="employerLiability">Employer Liability Number</Label>
                  <Input id="employerLiability" name="employer_liability" className="mt-1" placeholder="EL-025489698" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white text-sm">Registered Address</h3>
                <div>
                  <Label htmlFor="building">Building / Street <span className="text-red-500">*</span></Label>
                  <Input id="building" name="building" required className="mt-1" placeholder="Suite 43, Pine Street" />
                </div>
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <Label htmlFor="town">Town</Label>
                    <Input id="town" name="town" className="mt-1" placeholder="London" />
                  </div>
                  <div>
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input id="city" name="city" required className="mt-1" placeholder="London" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode <span className="text-red-500">*</span></Label>
                  <Input id="postcode" name="postcode" required className="mt-1" placeholder="SE1 8BQ" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Signature */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
              <h2 className="font-semibold text-white">Terms & Signature</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="terms" name="terms_accepted" required className="rounded border-emerald-500/20 bg-emerald-500/10 text-emerald-500 focus:ring-emerald-500" />
                <Label htmlFor="terms" className="text-sm font-normal text-slate-300">
                  I accept and agree to the Terms & Conditions
                </Label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="signature">Typed Full Name (Digital Signature) <span className="text-red-500">*</span></Label>
                  <Input id="signature" name="signature" required className="mt-1" placeholder="Alexander James Wright" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  )
}
