import { VariationLine, VariationFormData, VariationRow } from "./types"

export const ALL_USERS = [
  { id: "sm", name: "Site Manager", initials: "SM", color: "bg-emerald-600 text-white" },
  { id: "jw", name: "John Watson", initials: "JW", color: "bg-indigo-600 text-white" },
  { id: "er", name: "Emily Rose", initials: "ER", color: "bg-rose-600 text-white" },
  { id: "mj", name: "Mark Jones", initials: "MJ", color: "bg-amber-600 text-white" },
  { id: "alison", name: "Alison Tylor", initials: "AT", color: "bg-blue-600 text-white" },
  { id: "alex", name: "Alex Wanchis", initials: "AW", color: "bg-violet-600 text-white" },
  { id: "chanu", name: "Chanu Clap", initials: "CC", color: "bg-teal-600 text-white" },
  { id: "provin", name: "Provin Kumar", initials: "PK", color: "bg-orange-600 text-white" },
]

export const initialRows: VariationRow[] = [
  {
    id: "1", voNo: "VO-001", date: "2024-01-12", variationSheetNumber: "A",
    project: "Project A", siteInstructionNo: "SI21654321012",
    descriptionOfWorks: "Additional steelwork to level 3",
    createdBy: "John Watson", lines: [], totalAmount: 4500,
    evidence: "", comments: "Approved by site manager",
    assignedUserIds: ["sm", "jw"], approvalStatus: "Approved",
    approvedBy: "Commercial Manager", submittedToClient: true, signedByClient: true,
  },
  {
    id: "2", voNo: "VO-002", date: "2024-01-12", variationSheetNumber: "B",
    project: "Project B", siteInstructionNo: "SI24654321019",
    descriptionOfWorks: "Revised drainage layout",
    createdBy: "Emily Rose", lines: [], totalAmount: 2800,
    evidence: "", comments: "",
    assignedUserIds: ["er"], approvalStatus: "Pending",
    approvedBy: "", submittedToClient: false, signedByClient: false,
  },
  {
    id: "3", voNo: "VO-003", date: "2024-01-12", variationSheetNumber: "C",
    project: "Project C", siteInstructionNo: "SI24654321070",
    descriptionOfWorks: "Extra cabling runs to plant room",
    createdBy: "Mark Jones", lines: [], totalAmount: 1200,
    evidence: "", comments: "Awaiting client sign-off",
    assignedUserIds: ["mj", "alison"], approvalStatus: "Approved",
    approvedBy: "Commercial Manager", submittedToClient: true, signedByClient: false,
  },
  {
    id: "4", voNo: "VO-004", date: "2024-01-12", variationSheetNumber: "D",
    project: "Project A", siteInstructionNo: "SI24659091030",
    descriptionOfWorks: "Temporary works for access platform",
    createdBy: "Alex Wanchis", lines: [], totalAmount: 3600,
    evidence: "", comments: "",
    assignedUserIds: ["alex"], approvalStatus: "Rejected",
    approvedBy: "Commercial Manager", submittedToClient: false, signedByClient: false,
  },
]

export const summaryMetrics = [
  { label: "Variations", value: "£12,100" },
  { label: "Approved", value: "2", valueColor: "green" as const },
  { label: "Awaiting Approval", value: "1", valueColor: "red" as const },
  { label: "Submitted to Client", value: "2" },
  { label: "Signed by Client", value: "1" },
]

export const PROJECTS = ["Project A", "Project B", "Project C"]

export const emptyLine = (): VariationLine => ({
  no: "", siteInstruction: "", workArea: "", workSection: "",
  labour: 0, labourTarget: 0, material: 0, qty: 1,
})

export const defaultForm = (): VariationFormData => ({
  project: "", siteInstructionNo: "", attentionOf: "",
  descriptionOfWorks: "", lines: [emptyLine()], comments: "",
})

export function lineTotal(l: VariationLine) {
  return (l.labour + l.material) * l.qty
}

export function formatGBP(n: number) {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP" })
}

export function buildVariationDocHtml(variation: VariationRow) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Variation ${variation.voNo}</title>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; color: #111;">
    <div style="max-width: 720px; margin: 0 auto; padding: 24px;">
      <h1 style="margin: 0 0 8px;">VARIATION ORDER</h1>
      <div style="margin: 0 0 16px; font-size: 12px;">
        <div><strong>VO No:</strong> ${variation.voNo}</div>
        <div><strong>Project:</strong> ${variation.project}</div>
        <div><strong>Date:</strong> ${variation.date}</div>
        <div><strong>Site Instruction No:</strong> ${variation.siteInstructionNo}</div>
        <div><strong>Status:</strong> ${variation.approvalStatus}</div>
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
      <p style="font-size: 14px;"><strong>Description of Works:</strong><br/>${variation.descriptionOfWorks}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px;">Site Instruction</th>
            <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Labour</th>
            <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Material</th>
            <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">QTY</th>
            <th style="text-align: right; border-bottom: 1px solid #ddd; padding: 8px 4px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${variation.lines.map(l => `
            <tr>
              <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0;">${l.siteInstruction || "-"}</td>
              <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatGBP(l.labour)}</td>
              <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatGBP(l.material)}</td>
              <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${l.qty}</td>
              <td style="padding: 8px 4px; border-bottom: 1px solid #f0f0f0; text-align: right;">${formatGBP((l.labour + l.material) * l.qty)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="padding: 12px 4px; text-align: right;"><strong>Total Amount</strong></td>
            <td style="padding: 12px 4px; text-align: right;"><strong>${formatGBP(variation.totalAmount)}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top: 16px; font-size: 11px; color: #444;">
        This is a generated variation order document.
      </p>
    </div>
  </body>
</html>`
}
