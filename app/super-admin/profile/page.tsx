import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function Page() {
  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Project admin profile</h1>
        <p className="text-sm text-muted-foreground">
          Read-only view of your subscription registration information. If you
          need to update any details, please contact system administration.
        </p>
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
                <label className="text-xs text-slate-400">Password</label>
                <p className="mt-1 text-sm text-slate-100">••••••••</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  Confirm Password
                </label>
                <p className="mt-1 text-sm text-slate-100">••••••••</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">Professional Details</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-slate-400">
                  Second Categories
                </label>
                <p className="mt-1 flex flex-wrap gap-2 text-sm">
                  <span className="inline-flex rounded bg-blue-500/20 px-2 py-1 text-blue-300">
                    Electrical
                  </span>
                  <span className="inline-flex rounded bg-blue-500/20 px-2 py-1 text-blue-300">
                    Mechanical
                  </span>
                  <span className="inline-flex rounded bg-blue-500/20 px-2 py-1 text-blue-300">
                    Plumbing
                  </span>
                  <span className="inline-flex rounded bg-blue-500/20 px-2 py-1 text-blue-300">
                    HVAC
                  </span>
                  <span className="inline-flex rounded bg-blue-500/20 px-2 py-1 text-blue-300">
                    Fire Safety
                  </span>
                  <span className="inline-flex rounded bg-blue-500/20 px-2 py-1 text-blue-300">
                    Site
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications & Compliance */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">
                Certifications & Compliance
              </h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      IPAF
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300">
                      Valid
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Exp. IN-814644 Expires: 01 Jul 2025
                  </p>
                  <Link
                    href="#"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    View Certificate
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      PASMA
                    </span>
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      Expiring Soon
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Exp. EN-25048 Expires: 06 May 2024
                  </p>
                  <Link
                    href="#"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    View Certificate
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      SSSTS / SMSTS
                    </span>
                    <Badge className="bg-red-500/20 text-red-300">
                      Expired
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Exp. SN-001708 Expires: 01 Nov 2021
                  </p>
                  <Link
                    href="#"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    View Certificate
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      CSCS / JCR / JIB
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300">
                      Valid
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Exp. SJ-SA1628 Expires: 12 Jun 2028
                  </p>
                  <Link
                    href="#"
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    View Certificate
                  </Link>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">Company Information</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-slate-400">Company Name</label>
                <p className="mt-1 text-sm text-slate-100">
                  Wright Construction Ltd
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  Company House Number
                </label>
                <p className="mt-1 text-sm text-slate-100">10348978</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Company UTR</label>
                <p className="mt-1 text-sm text-slate-100">DESC182101</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">VAT Reviewed</label>
                <p className="mt-1 text-sm text-slate-100">Not provided</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">Bank Details</h2>
            </div>
            <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              ✓ Secure Details: Bank information is encrypted and stored
              securely. Only certain staff and applicants can see it.
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-xs text-slate-400">Bank Name</label>
                <p className="mt-1 text-sm text-slate-100">Barclays Bank PLC</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Bank Address</label>
                <p className="mt-1 text-sm text-slate-100">
                  1 Churchill Place, London, E14 5HP
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-400">
                  Account Holder Name
                </label>
                <p className="mt-1 text-sm text-slate-100">Alexander Wright</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Account Number</label>
                <p className="mt-1 text-sm text-slate-100">•••• •••• 6049</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Sort Code</label>
                <p className="mt-1 text-sm text-slate-100">••-•• 49</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance & Address */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">Insurance & Address</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Insurance Policies</h3>
                <div className="space-y-3">
                  <Card>
                    <CardContent>
                      <label className="text-xs text-slate-400">
                        Insurance Policies
                      </label>
                      <p className="mt-2 text-xs text-slate-100">
                        Policy Number: PL-387824321
                        <br />
                        Expiry Date: 31 Dec 2024
                      </p>
                      <Link
                        href="#"
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                      >
                        View Policy Document
                      </Link>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <label className="text-xs text-slate-400">
                        Employer Liability
                      </label>
                      <p className="mt-2 text-xs text-slate-100">
                        Policy Number: EL-025489698
                        <br />
                        Expiry Date: 31 Dec 2024
                      </p>
                      <Link
                        href="#"
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                      >
                        View Policy Document
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white">Registered Address</h3>
                <Card>
                  <CardContent>
                    <div>
                      <label className="text-xs text-slate-400">
                        Building / Inferno / Street
                      </label>
                      <p className="mt-1 text-sm text-slate-100">
                        Suite 43, Pine Street
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Town</label>
                      <p className="mt-1 text-sm text-slate-100">London</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">City</label>
                      <p className="mt-1 text-sm text-slate-100">London</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Postcode</label>
                      <p className="mt-1 text-sm text-slate-100">SE1 8BQ</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Signature */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">Terms & Signature</h2>
            </div>
            <div className="space-y-4">
              <div className="flex rounded border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                ✓ Terms & Conditions accepted and agreed to
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardContent>
                    <p className="text-xs text-slate-400">Digital Signature</p>
                    <p className="font-semibold text-white">Alexander Wright</p>
                    <p className="text-xs text-slate-400">Signed Digitally</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <p className="text-xs text-slate-400">Typed Full Name</p>
                    <p className="text-sm text-slate-100">
                      Alexander James Wright
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Signature Date</p>
                        <p className="mt-1 text-sm text-slate-100">
                          24 October 2023, 14:32 GMT
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
