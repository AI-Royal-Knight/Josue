"use client"

import { useState } from "react"
import { Search, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type QuoteItem = {
  id: number
  description: string
  qty: string
  discount: string
  per: string
  each: string
  totalValue: string
  comments: string
}

const createRow = (id: number): QuoteItem => ({
  id,
  description: "Paste from Excel sheet",
  qty: "QTY",
  discount: "0.00",
  per: "Unit",
  each: "0.00",
  totalValue: "$",
  comments: "Supplier comments",
})

export default function Page() {
  const [rows, setRows] = useState<QuoteItem[]>([
    createRow(1),
    createRow(2),
    createRow(3),
    createRow(4),
    createRow(5),
    createRow(6),
    createRow(7),
    createRow(8),
  ])

  return (
    <div className="w-full min-w-0 space-y-8 p-6">
      <div className="max-w-[660px] rounded-none border border-white/10 bg-gradient-to-b from-[#182842] to-[#0e1728] p-6">
        <div className="space-y-5 rounded-none border border-white/10 p-5">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Project</label>
            <div className="relative">
              <Search className="absolute top-2.5 right-3 size-4 text-slate-500" />
              <Input
                placeholder="Search projects..."
                className="border-white/10 bg-[#152540] pr-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Name</label>
            <Input
              placeholder="Save as user / auto-filled"
              className="border-white/10 bg-[#152540]"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Invoice No.</label>
            <Input
              placeholder="Enter invoice number"
              className="border-white/10 bg-[#152540]"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">PO Ref</label>
            <div className="relative">
              <Search className="absolute top-2.5 right-3 size-4 text-slate-500" />
              <Input
                placeholder="Search PO references..."
                className="border-white/10 bg-[#152540] pr-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Call Off Ref</label>
            <div className="relative">
              <Search className="absolute top-2.5 right-3 size-4 text-slate-500" />
              <Input
                placeholder="Search call off references..."
                className="border-white/10 bg-[#152540] pr-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Variation Ref</label>
            <div className="relative">
              <Search className="absolute top-2.5 right-3 size-4 text-slate-500" />
              <Input
                placeholder="Search variation references..."
                className="border-white/10 bg-[#152540] pr-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Other Ref</label>
            <div className="space-y-1">
              <Input
                placeholder="Enter other reference"
                className="border-white/10 bg-[#152540]"
              />
              <p className="text-[11px] text-slate-500">Use if PO not found</p>
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Date</label>
            <Input type="date" className="border-white/10 bg-[#152540]" />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Payment Due Date</label>
            <Input type="date" className="border-white/10 bg-[#152540]" />
          </div>

          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-sm text-slate-300">Invoice Total.</label>
            <Input
              placeholder="Enter amount"
              className="border-white/10 bg-[#152540]"
            />
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4">
            <label className="pt-2 text-sm text-slate-300">Attachments</label>
            <div className="rounded-none border border-white/10 bg-[#121f34] p-6 text-center">
              <Upload className="mx-auto mb-2 size-5 text-slate-400" />
              <p className="text-sm text-slate-300">
                Attach PDFs (Multiple allowed)
              </p>
              <p className="text-xs text-slate-500">
                Drag & drop or click to browse
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            className="border-white/10 bg-[#132239] text-slate-200 hover:bg-[#1a2c49]"
            onClick={() =>
              setRows((prev) => [...prev, createRow(prev.length + 1)])
            }
          >
            + Add another invoice
          </Button>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <Button className="w-full bg-[#4a8dff] text-white hover:bg-[#3a78df]">
            Submit Invoice
          </Button>
        </div>
      </div>

      <div className="max-w-[980px] overflow-hidden rounded-none border border-white/10 bg-gradient-to-b from-[#17263e] to-[#0f182a]">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-[#1b2a44] text-slate-300">
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">QTY</th>
              <th className="px-3 py-2 text-left">Discount</th>
              <th className="px-3 py-2 text-left">Per</th>
              <th className="px-3 py-2 text-left">Each</th>
              <th className="px-3 py-2 text-left">Total Value</th>
              <th className="px-3 py-2 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-white/5" key={row.id}>
                <td className="px-3 py-2 text-slate-300">{row.description}</td>
                <td className="px-3 py-2 text-slate-300">{row.qty}</td>
                <td className="px-3 py-2 text-slate-300">{row.discount}</td>
                <td className="px-3 py-2 text-slate-300">{row.per}</td>
                <td className="px-3 py-2 text-slate-300">{row.each}</td>
                <td className="px-3 py-2 text-[#5fa2ff]">{row.totalValue}</td>
                <td className="px-3 py-2 text-slate-400">{row.comments}</td>
              </tr>
            ))}
            <tr className="bg-[#1b2a44]">
              <td
                className="px-3 py-3 text-right font-semibold text-slate-300"
                colSpan={5}
              >
                TOTAL
              </td>
              <td className="px-3 py-3 font-semibold text-white">$</td>
              <td className="px-3 py-3" />
            </tr>
          </tbody>
        </table>

        <div className="border-t border-white/10 p-3">
          <Button
            variant="outline"
            className="border-white/10 bg-[#132239] text-slate-200 hover:bg-[#1a2c49]"
            onClick={() =>
              setRows((prev) => [...prev, createRow(prev.length + 1)])
            }
          >
            + Add Row
          </Button>
        </div>
      </div>

      <div className="max-w-[980px] text-right">
        <Button className="bg-[#ffd100] text-black hover:bg-[#e4bc00]">
          Submit Quote
        </Button>
      </div>
    </div>
  )
}
