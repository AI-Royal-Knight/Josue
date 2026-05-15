"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./breadcrumb"

type Crumb = { label: string; href?: string }

export default function BreadcrumbWithBack({
  items = [],
  className,
}: {
  items?: Crumb[]
  className?: string
}) {
  const router = useRouter()

  return (
    <div className={`flex items-center justify-between ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ChevronLeft />
          <span className="sr-only">Back</span>
        </Button>

        <Breadcrumb>
          <BreadcrumbList>
            {items.map((it, idx) => (
              <React.Fragment key={idx}>
                <BreadcrumbItem>
                  {it.href ? (
                    <BreadcrumbLink href={it.href}>{it.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{it.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < items.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}
