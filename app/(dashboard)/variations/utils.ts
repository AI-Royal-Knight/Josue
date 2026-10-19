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
    project: "Project A", projectId: "",
    siteInstructionNo: "SI21654321012",
    descriptionOfWorks: "Additional steelwork to level 3",
    createdBy: "John Watson", lines: [], totalAmount: 4500,
    evidence: "", comments: "Approved by site manager",
    assignedUserIds: ["sm", "jw"], approvalStatus: "Approved",
    approvedBy: "Commercial Manager", submittedToClient: true, signedByClient: true,
  },
  {
    id: "2", voNo: "VO-002", date: "2024-01-12", variationSheetNumber: "B",
    project: "Project B", projectId: "",
    siteInstructionNo: "SI24654321019",
    descriptionOfWorks: "Revised drainage layout",
    createdBy: "Emily Rose", lines: [], totalAmount: 2800,
    evidence: "", comments: "",
    assignedUserIds: ["er"], approvalStatus: "Pending",
    approvedBy: "", submittedToClient: false, signedByClient: false,
  },
  {
    id: "3", voNo: "VO-003", date: "2024-01-12", variationSheetNumber: "C",
    project: "Project C", projectId: "",
    siteInstructionNo: "SI24654321070",
    descriptionOfWorks: "Extra cabling runs to plant room",
    createdBy: "Mark Jones", lines: [], totalAmount: 1200,
    evidence: "", comments: "Awaiting client sign-off",
    assignedUserIds: ["mj", "alison"], approvalStatus: "Approved",
    approvedBy: "Commercial Manager", submittedToClient: true, signedByClient: false,
  },
  {
    id: "4", voNo: "VO-004", date: "2024-01-12", variationSheetNumber: "D",
    project: "Project A", projectId: "",
    siteInstructionNo: "SI24659091030",
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
  descriptionOfWorks: "", lines: [emptyLine()], comments: "", evidence: null,
})

export function lineTotal(l: VariationLine) {
  return (l.labour + l.material) * l.qty
}

export function formatGBP(n: number) {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP" })
}

export function buildVariationDocHtml(variation: VariationRow) {
  const formatText = (text: string) => (text || "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Variation ${variation.voNo}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 20mm 15mm;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        color: #111;
        margin: 0;
        padding: 20px;
        -webkit-print-color-adjust: exact;
      }
      .container {
        width: 100%;
        max-width: 720px;
        margin: 0 auto;
        padding: 0;
        box-sizing: border-box;
      }
      h1 { margin: 0 0 12px; font-size: 20px; font-weight: bold; }
      .meta { margin: 0 0 16px; font-size: 12px; line-height: 1.6; }
      .desc-box {
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
        overflow-wrap: break-word;
        word-wrap: break-word;
        white-space: normal;
        margin: 16px 0;
      }
      table {
        width: 100%;
        max-width: 100%;
        table-layout: fixed;
        border-collapse: collapse;
        font-size: 12px;
        margin-top: 16px;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      th, td { box-sizing: border-box; }
      th { border-bottom: 2px solid #222; padding: 8px 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
      td { border-bottom: 1px solid #e5e7eb; padding: 8px 6px; }
      .col-desc {
        width: 44%;
        text-align: left;
        word-break: break-word;
        overflow-wrap: break-word;
        word-wrap: break-word;
        white-space: normal;
        vertical-align: top;
        line-height: 1.4;
      }
      .col-num { width: 14%; text-align: right; white-space: nowrap; vertical-align: top; }
      .col-qty { width: 12%; text-align: right; white-space: nowrap; vertical-align: top; }
      .col-total { width: 16%; text-align: right; white-space: nowrap; vertical-align: top; font-weight: 600; }
      tfoot td { border-top: 2px solid #222; padding: 12px 6px; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>VARIATION ORDER</h1>
      <div class="meta">
        <div><strong>VO No:</strong> ${variation.voNo}</div>
        <div><strong>Project:</strong> ${variation.project}</div>
        <div><strong>Date:</strong> ${variation.date}</div>
        <div><strong>Site Instruction No:</strong> ${variation.siteInstructionNo || "—"}</div>
        <div><strong>Status:</strong> ${variation.approvalStatus}</div>
      </div>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
      <div class="desc-box">
        <strong>Description of Works:</strong><br/>
        ${formatText(variation.descriptionOfWorks)}
      </div>
      <table width="100%" cellpadding="6" cellspacing="0" style="width: 100%; table-layout: fixed; border-collapse: collapse;">
        <thead>
          <tr>
            <th class="col-desc" width="44%" style="width: 44%;">Description / Site Instruction</th>
            <th class="col-num" width="14%" style="width: 14%;">Labour</th>
            <th class="col-num" width="14%" style="width: 14%;">Material</th>
            <th class="col-qty" width="12%" style="width: 12%;">QTY</th>
            <th class="col-total" width="16%" style="width: 16%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${variation.lines.map((l, i) => `
            <tr>
              <td class="col-desc" width="44%" style="width: 44%; word-break: break-word; overflow-wrap: break-word; word-wrap: break-word; white-space: normal; vertical-align: top;">
                ${formatText(l.siteInstruction || `Item ${i + 1}`)}
              </td>
              <td class="col-num" width="14%" style="width: 14%; text-align: right; white-space: nowrap; vertical-align: top;">${formatGBP(l.labour)}</td>
              <td class="col-num" width="14%" style="width: 14%; text-align: right; white-space: nowrap; vertical-align: top;">${formatGBP(l.material)}</td>
              <td class="col-qty" width="12%" style="width: 12%; text-align: right; white-space: nowrap; vertical-align: top;">${l.qty}</td>
              <td class="col-total" width="16%" style="width: 16%; text-align: right; white-space: nowrap; vertical-align: top; font-weight: 600;">${formatGBP((l.labour + l.material) * l.qty)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align: right;">Total Amount</td>
            <td class="col-total" width="16%" style="width: 16%; text-align: right; white-space: nowrap; font-weight: bold;">${formatGBP(variation.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top: 24px; font-size: 11px; color: #666;">
        This is a generated variation order document.
      </p>
    </div>
  </body>
</html>`
}
