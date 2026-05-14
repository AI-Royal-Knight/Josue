"use client"

import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// export const metadata = {
//   title: "Variations",
// }

const infoRows = [
  { label: "Project:", value: "project info automatic" },
  { label: "Site Code:", value: "project info automatic" },
  { label: "Site instruction No:", value: "type" },
  { label: "Attention of:", value: "type" },
  { label: "Main Contractor:", value: "project info automatic" },
]

const metaRows = [
  { label: "VO No:", value: "Automatic Generated" },
  { label: "Date:", value: "automatic" },
  { label: "QS:", value: "whoever is registered as the commercial manager" },
  { label: "Created by:", value: "whoever creates the Variation" },
]

const tableRows = [
  {
    no: "1",
    siteInstruction: "Type description of work - not linked to variation list or summary",
    workArea: "TYPE",
    workSection: "TYPE",
    labour: "TYPE VALUE",
    material: "TYPE VALUE",
    qty: "NUMBER",
    total: "LABOUR + MATERIAL x QTY",
  },
  {
    no: "2",
    siteInstruction: "Type description of work - not linked to variation list or summary",
    workArea: "TYPE",
    workSection: "TYPE",
    labour: "TYPE VALUE",
    material: "TYPE VALUE",
    qty: "NUMBER",
    total: "LABOUR + MATERIAL x QTY",
  },
]

export default function Page() {
  return (
    <div className="w-full p-6">
      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-[#0f182a] via-[#0c1424] to-[#0b1220] p-6 text-slate-100 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Project Overview
            </p>
            <div className="mt-3 max-w-xs">
              <label className="mb-2 block text-xs font-semibold text-slate-300">
                Select Project
              </label>
              <Select defaultValue="project-a">
                <SelectTrigger className="h-9 border-white/10 bg-[#0e182c] text-slate-200">
                  <SelectValue placeholder="Project A" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0e182c] text-slate-200">
                  <SelectItem value="project-a">Project A</SelectItem>
                  <SelectItem value="project-b">Project B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-[0.12em]">
              VARIATION FORM
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border border-white/10 bg-[#0f1c36]" />
            <div className="text-right leading-tight">
              <div className="text-lg font-semibold">Rivo</div>
              <div className="text-lg font-semibold text-emerald-300">Zen.</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Marketing Agency
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-200">
            ADDENDUM VARIATION QUOTATION
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2 text-xs text-slate-300">
              {infoRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[140px_1fr]">
                  <span className="font-semibold text-slate-200">
                    {row.label}
                  </span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              {metaRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[120px_1fr]">
                  <span className="font-semibold text-slate-200">
                    {row.label}
                  </span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 text-xs font-semibold text-slate-200">
          Reason for Variation/ Description of works
        </div>
        <div className="mb-6 rounded bg-[#2f68e0] px-4 py-3 text-center text-xs font-semibold tracking-[0.08em] text-white">
          TYPE - Linked to variation list and variation summary
        </div>

        <div className="mb-6 overflow-x-auto rounded border border-white/10">
          <table className="w-full min-w-[960px] border-collapse text-xs text-slate-200">
            <thead className="bg-[#0f1d36] text-[11px]">
              <tr>
                <th className="border border-[#1d3150] px-2 py-2 text-left">No.</th>
                <th className="border border-[#1d3150] px-2 py-2 text-left">
                  Site instruction number
                </th>
                <th className="border border-[#1d3150] px-2 py-2 text-left">
                  Work area
                </th>
                <th className="border border-[#1d3150] px-2 py-2 text-left">
                  Work section
                </th>
                <th className="border border-[#1d3150] px-2 py-2 text-left">
                  Labour
                </th>
                <th className="border border-[#1d3150] px-2 py-2 text-left">
                  Material
                </th>
                <th className="border border-[#1d3150] px-2 py-2 text-left">QTY</th>
                <th className="border border-[#1d3150] px-2 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.no} className="border-t border-[#1d3150]">
                  <td className="border border-[#1d3150] px-2 py-3 text-slate-300">
                    {row.no}
                  </td>
                  <td className="border border-[#1d3150] px-2 py-3 text-slate-300">
                    {row.siteInstruction}
                  </td>
                  <td className="border border-[#1d3150] px-2 py-3 text-slate-300">
                    {row.workArea}
                  </td>
                  <td className="border border-[#1d3150] px-2 py-3 text-slate-300">
                    {row.workSection}
                  </td>
                  <td className="border border-[#1d3150] px-2 py-3 text-slate-300">
                    {row.labour}
                  </td>
                  <td className="border border-[#1d3150] px-2 py-3 text-slate-300">
                    {row.material}
                  </td>
                  <td className="border border-[#1d3150] px-2 py-3 text-slate-300">
                    {row.qty}
                  </td>
                  <td className="border border-[#1d3150] px-2 py-3 text-slate-300">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-2 text-[11px] text-slate-300">
          Other Instructions/ Clarifications:
          <span className="ml-2 text-slate-400">
            Material Lead Times TBC upon receipt of official order. Impact on programme TBC. Our offer is open for one month from receipt.
          </span>
        </div>

        <div className="mb-2 flex items-center justify-between rounded bg-[#1e293b] px-4 py-2 text-xs font-semibold">
          <span>Total Variation Quote</span>
          <span>TOTAL</span>
        </div>

        <div className="mb-2 rounded bg-[#2f68e0] px-4 py-2 text-xs font-semibold">
          Evidence <span className="ml-2 text-slate-200">drop PDFS, OR PICTURES</span>
        </div>

        <div className="mb-4 rounded bg-[#1e293b] px-4 py-2 text-xs font-semibold">
          Qualifications &amp; Comments
        </div>

        <div className="mb-6 text-xs text-slate-300">a)</div>

        <div className="mb-8 text-center text-xs font-semibold text-slate-200">
          ** N.B: For works to proceed please sign and return ASAP **
        </div>

        <div className="mb-8 grid gap-6 text-[11px] text-slate-300 md:grid-cols-2">
          <div className="space-y-2">
            <div>Print Name : CLIENT PRINT NAME</div>
            <div>Signed on for and behalf of : CLIENT TYPE</div>
          </div>
          <div className="space-y-2 text-right">
            <div>Signed in Agreement : CLIENT SIGN</div>
          </div>
        </div>

        <div className="rounded bg-[#2f68e0] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em]">
          84 ALERS ROAD, BEXLEYHEATH DA6 8HT - COMPANY ADDRESS AND INFORMATION BELOW
        </div>
      </div>
    </div>
  )
}
