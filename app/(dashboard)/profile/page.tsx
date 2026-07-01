"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Pencil, Check, X } from "lucide-react"
import { getProfile, updateProfile, ProfileResponse } from "@/lib/api/profile"

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  
  // Profile nested fields
  categories: z.string().optional(),
  cscs_card_no: z.string().optional(),
  cscs_expiry_date: z.string().optional(),
  ipaf_certification: z.string().optional(),
  pasma_certification: z.string().optional(),
  sssts_smsts: z.string().optional(),
  insurance_policy: z.string().optional(),
  employer_liability: z.string().optional(),
  digital_signature: z.string().optional(),
  
  // Company nested fields
  company_name: z.string().optional(),
  company_number: z.string().optional(),
  vat_number: z.string().optional(),
  bank_name: z.string().optional(),
  bank_address: z.string().optional(),
  account_name: z.string().optional(), // No account name in DB, we'll store it in bank_address or something else? Wait, backend has bank_name, bank_address, sort_code, account_number. We will use those.
  account_number: z.string().optional(),
  sort_code: z.string().optional(),
  building_number: z.string().optional(),
  street: z.string().optional(),
  town: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      categories: "",
      cscs_card_no: "",
      cscs_expiry_date: "",
      ipaf_certification: "",
      pasma_certification: "",
      sssts_smsts: "",
      insurance_policy: "",
      employer_liability: "",
      digital_signature: "",
      company_name: "",
      company_number: "",
      vat_number: "",
      bank_name: "",
      bank_address: "",
      account_number: "",
      sort_code: "",
      building_number: "",
      street: "",
      postcode: "",
    }
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const data = await getProfile()
      setProfileData(data)
      form.reset({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        categories: data.profile?.categories || "",
        cscs_card_no: data.profile?.cscs_card_no || "",
        cscs_expiry_date: data.profile?.cscs_expiry_date || "",
        ipaf_certification: data.profile?.ipaf_certification || "",
        pasma_certification: data.profile?.pasma_certification || "",
        sssts_smsts: data.profile?.sssts_smsts || "",
        insurance_policy: data.profile?.insurance_policy || "",
        employer_liability: data.profile?.employer_liability || "",
        digital_signature: data.profile?.digital_signature || "",
        
        company_name: data.company?.company_name || "",
        company_number: data.company?.company_number?.toString() || "",
        vat_number: data.company?.vat_number || "",
        bank_name: data.company?.bank_name || "",
        bank_address: data.company?.bank_address || "",
        account_number: data.company?.account_number || "",
        sort_code: data.company?.sort_code || "",
        building_number: data.company?.building_number?.toString() || "",
        street: data.company?.street || "",
        postcode: data.company?.postcode || "",
      })
    } catch (err) {
      setError("Failed to load profile data.")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setError(null)
      await updateProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        profile: {
          categories: values.categories,
          cscs_card_no: values.cscs_card_no,
          cscs_expiry_date: values.cscs_expiry_date,
          ipaf_certification: values.ipaf_certification,
          pasma_certification: values.pasma_certification,
          sssts_smsts: values.sssts_smsts,
          insurance_policy: values.insurance_policy,
          employer_liability: values.employer_liability,
          digital_signature: values.digital_signature,
        },
        company: {
          company_name: values.company_name,
          company_number: values.company_number ? parseInt(values.company_number) : null,
          vat_number: values.vat_number,
          bank_name: values.bank_name,
          bank_address: values.bank_address,
          account_number: values.account_number,
          sort_code: values.sort_code,
          building_number: values.building_number ? parseInt(values.building_number) : null,
          street: values.street,
          postcode: values.postcode,
        }
      })
      setIsEditing(false)
      loadProfile()
    } catch (err) {
      setError("Failed to update profile.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">User Profile</h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Edit your profile details below." : "Read-only view of your profile information."}
          </p>
        </div>
        <div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditing(false)
                form.reset()
              }}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <form className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mt-6">
              <h2 className="font-semibold text-white">Basic Information</h2>
            </div>
            <div className="grid gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-400">First Name</label>
                {isEditing ? (
                  <Input {...form.register("first_name")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("first_name") || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400">Last Name</label>
                {isEditing ? (
                  <Input {...form.register("last_name")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("last_name") || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400">Email Address</label>
                {isEditing ? (
                  <Input {...form.register("email")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("email")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mt-6">
              <h2 className="font-semibold text-white">Professional Details</h2>
            </div>
            <div className="grid gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-400">Categories / Profession</label>
                {isEditing ? (
                  <Input {...form.register("categories")} className="mt-1" placeholder="e.g. Electrical, Plumbing" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("categories") || "Not provided"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications & Compliance */}
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mt-6">
              <h2 className="font-semibold text-white">Certifications & Compliance</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <span className="text-sm font-semibold text-white">IPAF</span>
                    <div>
                      <label className="text-xs text-slate-400">Certification Details</label>
                      {isEditing ? (
                        <Input {...form.register("ipaf_certification")} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-sm text-slate-100">{form.getValues("ipaf_certification") || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <span className="text-sm font-semibold text-white">PASMA</span>
                    <div>
                      <label className="text-xs text-slate-400">Certification Details</label>
                      {isEditing ? (
                        <Input {...form.register("pasma_certification")} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-sm text-slate-100">{form.getValues("pasma_certification") || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <span className="text-sm font-semibold text-white">SSSTS / SMSTS</span>
                    <div>
                      <label className="text-xs text-slate-400">Certification Details</label>
                      {isEditing ? (
                        <Input {...form.register("sssts_smsts")} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-sm text-slate-100">{form.getValues("sssts_smsts") || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <span className="text-sm font-semibold text-white">CSCS</span>
                    <div>
                      <label className="text-xs text-slate-400">Card No.</label>
                      {isEditing ? (
                        <Input {...form.register("cscs_card_no")} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-sm text-slate-100">{form.getValues("cscs_card_no") || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Expiry Date</label>
                      {isEditing ? (
                        <Input type="date" {...form.register("cscs_expiry_date")} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-sm text-slate-100">{form.getValues("cscs_expiry_date") || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mt-6">
              <h2 className="font-semibold text-white">Company Information</h2>
            </div>
            <div className="grid gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-400">Company Name</label>
                {isEditing ? (
                  <Input {...form.register("company_name")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("company_name") || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400">Company Number</label>
                {isEditing ? (
                  <Input {...form.register("company_number")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("company_number") || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400">VAT Number / UTR</label>
                {isEditing ? (
                  <Input {...form.register("vat_number")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("vat_number") || "Not provided"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mt-6">
              <h2 className="font-semibold text-white">Bank Details</h2>
            </div>
            <div className="grid gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-400">Bank Name</label>
                {isEditing ? (
                  <Input {...form.register("bank_name")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("bank_name") || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400">Bank Address</label>
                {isEditing ? (
                  <Input {...form.register("bank_address")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("bank_address") || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400">Account Number</label>
                {isEditing ? (
                  <Input {...form.register("account_number")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("account_number") || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400">Sort Code</label>
                {isEditing ? (
                  <Input {...form.register("sort_code")} className="mt-1" />
                ) : (
                  <p className="mt-1 text-sm text-slate-100">{form.getValues("sort_code") || "Not provided"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance & Address */}
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mt-6">
              <h2 className="font-semibold text-white">Insurance & Address</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Insurance Policies</h3>
                <div className="space-y-3">
                  <Card>
                    <CardContent className="pt-6">
                      <label className="text-xs text-slate-400">Insurance Policy</label>
                      {isEditing ? (
                        <Input {...form.register("insurance_policy")} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-sm text-slate-100">{form.getValues("insurance_policy") || "Not provided"}</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <label className="text-xs text-slate-400">Employer Liability</label>
                      {isEditing ? (
                        <Input {...form.register("employer_liability")} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-sm text-slate-100">{form.getValues("employer_liability") || "Not provided"}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white">Registered Address</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs text-slate-400">Building Number</label>
                        {isEditing ? (
                          <Input {...form.register("building_number")} className="mt-1" />
                        ) : (
                          <p className="mt-1 text-sm text-slate-100">{form.getValues("building_number") || "Not provided"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Street</label>
                        {isEditing ? (
                          <Input {...form.register("street")} className="mt-1" />
                        ) : (
                          <p className="mt-1 text-sm text-slate-100">{form.getValues("street") || "Not provided"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Town</label>
                        {isEditing ? (
                          <Input {...form.register("town")} className="mt-1" />
                        ) : (
                          <p className="mt-1 text-sm text-slate-100">{form.getValues("town") || "Not provided"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">City</label>
                        {isEditing ? (
                          <Input {...form.register("city")} className="mt-1" />
                        ) : (
                          <p className="mt-1 text-sm text-slate-100">{form.getValues("city") || "Not provided"}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">Postcode</label>
                        {isEditing ? (
                          <Input {...form.register("postcode")} className="mt-1" />
                        ) : (
                          <p className="mt-1 text-sm text-slate-100">{form.getValues("postcode") || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Signature */}
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mt-6">
              <h2 className="font-semibold text-white">Terms & Signature</h2>
            </div>
            <div className="space-y-4 mt-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-slate-400">Digital Signature / Typed Name</p>
                    {isEditing ? (
                      <Input {...form.register("digital_signature")} className="mt-1" />
                    ) : (
                      <p className="font-semibold text-white mt-1">{form.getValues("digital_signature") || "Not provided"}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
