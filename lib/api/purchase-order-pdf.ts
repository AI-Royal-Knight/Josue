/**
 * API helpers for Purchase Order PDF operations.
 */

import { apiRequest, getApiBaseUrl } from "./client"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("tresta:accessToken")
}

export type ParsedPOData = {
  supplier_name: string
  supplier_address: string
  fao: string
  quotation_number: string
  your_ref: string
  job_site_ref: string
  quotation_date: string
  line_items: {
    cat_no: string
    description: string
    discount: string
    quantity: string
    unit_price: string
    total_value: string
  }[]
  grand_total: string
  raw_text: string
}

/**
 * Send a PDF file to the backend for parsing.
 * Returns structured PO data extracted from the PDF.
 */
export async function parsePOPDF(file: File): Promise<ParsedPOData> {
  const formData = new FormData()
  formData.append("file", file)

  return apiRequest<ParsedPOData>("/procurement/po/parse-pdf/", {
    method: "POST",
    body: formData,
  })
}

/**
 * Send parsed PO data to the backend and download a branded PDF.
 * Returns a Blob of the generated PDF bytes.
 */
export async function generateBrandedPOPDF(parsed: ParsedPOData): Promise<Blob> {
  const token = getToken()
  const apiBase = getApiBaseUrl()
  const response = await fetch(`${apiBase}/procurement/po/generate-pdf/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(parsed),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `Failed to generate PDF (${response.status})`)
  }

  return response.blob()
}
