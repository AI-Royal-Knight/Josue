"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Building2, Landmark, FileText, Upload, ImageIcon, Loader2 } from "lucide-react"
import FileUpload from "@/components/ui/file-uploader"
import { getProfile, updateProfile } from "@/lib/api/profile"
import { useEffect } from "react"

type CompanyDetails = {
  companyName: string
  buildingNumber: string
  street: string
  postcode: string
  companyNumber: string
  vat: string
  termsAndConditions: string
  bankName: string
  bankAddress: string
  sortCode: string
  accountNumber: string
  iban: string
  swift: string
}

const defaultDetails: CompanyDetails = {
  companyName: "",
  buildingNumber: "",
  street: "",
  postcode: "",
  companyNumber: "",
  vat: "",
  termsAndConditions: "",
  bankName: "",
  bankAddress: "",
  sortCode: "",
  accountNumber: "",
  iban: "",
  swift: "",
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
      <span className="text-slate-400">{icon}</span>
      <h2 className="font-semibold text-white">{title}</h2>
    </div>
  )
}

function Field({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-slate-400">
        {label}
      </Label>
      {children}
    </div>
  )
}

export default function AdminProfilePage() {
  const [details, setDetails] = useState<CompanyDetails>(defaultDetails)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true
    getProfile()
      .then((data) => {
        if (!isMounted) return
        const c = data.company
        if (c) {
          setDetails({
            companyName: c.company_name || "",
            companyNumber: c.company_number?.toString() || "",
            buildingNumber: c.building_number?.toString() || "",
            street: c.street || "",
            postcode: c.postcode || "",
            vat: c.vat_number || "",
            termsAndConditions: "",
            bankName: c.bank_name || "",
            bankAddress: c.bank_address || "",
            sortCode: c.sort_code || "",
            accountNumber: c.account_number || "",
            iban: c.iban || "",
            swift: c.swift_bic || "",
          })
          if (c.company_logo) {
            setLogoPreview(c.company_logo)
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load profile", err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSaved(false)
    setDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setSaved(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const companyPayload = {
        company_name: details.companyName,
        company_number: Number(details.companyNumber) || undefined,
        building_number: Number(details.buildingNumber) || undefined,
        street: details.street,
        postcode: details.postcode,
        vat_number: details.vat,
        bank_name: details.bankName,
        bank_address: details.bankAddress,
        sort_code: details.sortCode,
        account_number: details.accountNumber,
        iban: details.iban,
        swift_bic: details.swift,
      }

      const file = fileInputRef.current?.files?.[0]
      if (file) {
        const formData = new FormData()
        formData.append("company", JSON.stringify(companyPayload))
        formData.append("company_logo", file)
        await updateProfile(formData)
      } else {
        await updateProfile({
          company: companyPayload
        })
      }

      setSaved(true)
    } catch (err: any) {
      setError(err.message || "Failed to save profile.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Company Details</h1>
        <p className="text-sm text-slate-400">
          This information appears on all documents and in the users app.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Logo */}
        <Card>
          <CardContent className="space-y-4 pt-4">
            <SectionHeader
              icon={<ImageIcon className="size-4" />}
              title="Company Logo"
            />
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded border border-white/10 bg-white/5">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="Company logo preview"
                    className="h-full w-full rounded object-contain p-1"
                  />
                ) : (
                  <ImageIcon className="size-8 text-slate-600" />
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  Upload Logo
                </Button>
                <p className="text-xs text-slate-500">
                  PNG, JPG or SVG. Max 2 MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardContent className="space-y-4 pt-4">
            <SectionHeader
              icon={<Building2 className="size-4" />}
              title="Company Information"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company Name" id="companyName">
                <Input
                  id="companyName"
                  name="companyName"
                  value={details.companyName}
                  onChange={handleChange}
                  placeholder="Tresta Ltd"
                />
              </Field>
              <Field label="Company Number" id="companyNumber">
                <Input
                  id="companyNumber"
                  name="companyNumber"
                  value={details.companyNumber}
                  onChange={handleChange}
                  placeholder="12345678"
                />
              </Field>
              <Field label="Building Number" id="buildingNumber">
                <Input
                  id="buildingNumber"
                  name="buildingNumber"
                  value={details.buildingNumber}
                  onChange={handleChange}
                  placeholder="42"
                />
              </Field>
              <Field label="Street" id="street">
                <Input
                  id="street"
                  name="street"
                  value={details.street}
                  onChange={handleChange}
                  placeholder="High Street"
                />
              </Field>
              <Field label="Postcode" id="postcode">
                <Input
                  id="postcode"
                  name="postcode"
                  value={details.postcode}
                  onChange={handleChange}
                  placeholder="EC1A 1BB"
                />
              </Field>
              <Field label="VAT Number" id="vat">
                <Input
                  id="vat"
                  name="vat"
                  value={details.vat}
                  onChange={handleChange}
                  placeholder="GB 123 4567 89"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardContent className="space-y-4 pt-4">
            <SectionHeader
              icon={<FileText className="size-4" />}
              title="Companies Terms & Conditions"
            />
            <p className="text-xs text-slate-400">
              Every user invited to the app must read and agree to these terms
              before they can access the platform.
            </p>
            <FileUpload />
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardContent className="space-y-4 pt-4">
            <SectionHeader
              icon={<Landmark className="size-4" />}
              title="Bank Details"
            />
            <div className="rounded border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              ✓ Bank information is encrypted and stored securely.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name of Bank" id="bankName">
                <Input
                  id="bankName"
                  name="bankName"
                  value={details.bankName}
                  onChange={handleChange}
                  placeholder="Barclays Bank PLC"
                />
              </Field>
              <Field label="Address of Bank" id="bankAddress">
                <Input
                  id="bankAddress"
                  name="bankAddress"
                  value={details.bankAddress}
                  onChange={handleChange}
                  placeholder="1 Churchill Place, London, E14 5HP"
                />
              </Field>
              <Field label="Sort Code" id="sortCode">
                <Input
                  id="sortCode"
                  name="sortCode"
                  value={details.sortCode}
                  onChange={handleChange}
                  placeholder="20-00-00"
                />
              </Field>
              <Field label="Account Number" id="accountNumber">
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={details.accountNumber}
                  onChange={handleChange}
                  placeholder="12345678"
                />
              </Field>
              <Field label="IBAN" id="iban">
                <Input
                  id="iban"
                  name="iban"
                  value={details.iban}
                  onChange={handleChange}
                  placeholder="GB29 NWBK 6016 1331 9268 19"
                />
              </Field>
              <Field label="SWIFT / BIC" id="swift">
                <Input
                  id="swift"
                  name="swift"
                  value={details.swift}
                  onChange={handleChange}
                  placeholder="BARCGB22"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {saved && (
            <p className="text-sm text-emerald-400">
              ✓ Company details saved successfully.
            </p>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
