"use client"

import { useState } from "react"
import {
  CircleUserRound,
  FileText,
  Building2,
  Mail,
  BriefcaseBusiness,
  IdCard,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Card } from "./ui/card"

export type UserProfileDialogProps = {
  user: {
    name: string
    surname: string
    email: string
    profession: string
    cscsCardNo: string
    cscsExpiryDate: string
    cscsExpiryTone: "emerald" | "red"
    ipaf: string
    pasma: string
    company: string
    ssstsSmsts: string
    expiryDate: string
    expiryTone: "emerald" | "red"
  }
}

function StatusPill({
  children,
  tone,
}: {
  children: string
  tone: "blue" | "yellow" | "emerald" | "red"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] leading-none",
        tone === "blue" && "border-blue-500/30 bg-blue-500/10 text-blue-300",
        tone === "yellow" &&
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
        tone === "emerald" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        tone === "red" && "border-red-500/30 bg-red-500/10 text-red-300"
      )}
    >
      {children}
    </span>
  )
}

function DetailRow({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode
  label: string
  value: string
  status?: {
    label: string
    tone: "emerald" | "yellow" | "red"
  }
}) {
  return (
    <div className="border-b border-white/10 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-400">{icon}</div>
          <div className="text-[13px] text-slate-400">{label}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-100">
            <span className="truncate">{value}</span>
            {status ? (
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            ) : null}
          </div>
      </div>
    </div>
  )
}

export function UserProfileDialog({ user }: UserProfileDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          View
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[920px]"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="space-y-3 px-8">
                  <User className="size-10 text-slate-100" />
                  <DialogTitle className="text-3xl font-semibold text-white">
                    {user.name} {user.surname}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Profile details for {user.name} {user.surname}
                  </DialogDescription>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Reject
              </Button>
              <Button>Accept</Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-8 px-8 py-7 lg:grid-cols-2">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              Basic Information
            </div>
            <div>
              <DetailRow
                icon={<CircleUserRound className="size-4" />}
                label="First Name"
                value={user.name}
              />
              <DetailRow
                icon={<CircleUserRound className="size-4" />}
                label="Last Name"
                value={user.surname}
              />
              <DetailRow
                icon={<Mail className="size-4" />}
                label="Email Address"
                value={user.email}
              />
              <DetailRow
                icon={<Building2 className="size-4" />}
                label="Company"
                value={user.company}
              />
            </div>
          </section>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              Professional Details
            </div>
            <div>
              <DetailRow
                icon={<BriefcaseBusiness className="size-4" />}
                label="Profession"
                value={user.profession}
              />
              <DetailRow
                icon={<IdCard className="size-4" />}
                label="CSCS Card No."
                value={user.cscsCardNo}
              />
              <DetailRow
                icon={<CalendarDays className="size-4" />}
                label="CSCS Expiry Date"
                value={user.cscsExpiryDate}
                status={{
                  label: user.cscsExpiryTone === "red" ? "Invalid" : "Valid",
                  tone: user.cscsExpiryTone === "red" ? "red" : "emerald",
                }}
              />
              <DetailRow
                icon={<ShieldCheck className="size-4" />}
                label="IPAF Certification"
                value={user.ipaf}
                status={{
                  label: "Valid",
                  tone: "emerald",
                }}
              />
              <DetailRow
                icon={<ShieldCheck className="size-4" />}
                label="PASMA Certification"
                value={user.pasma}
                status={{
                  label: user.pasma === "No" ? "Not Available" : "Valid",
                  tone: user.pasma === "No" ? "red" : "emerald",
                }}
              />
              <DetailRow
                icon={<ShieldCheck className="size-4" />}
                label="SSSTS / SMSTS"
                value={user.ssstsSmsts}
                status={{
                  label: "Valid",
                  tone: "emerald",
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 text-sm text-slate-400 pt-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            Application submitted on Oct 24, 2023
          </div>
          <Button variant="outline">
            <FileText className="size-4" />
            View Documents
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
