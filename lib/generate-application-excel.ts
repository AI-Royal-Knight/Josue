// import * as XLSX from "xlsx"
// import { ApplicationPdfData } from "./generate-application-pdf"
// import { formatCurrency } from "./utils"

// export function generateApplicationExcel(data: ApplicationPdfData) {
//   const { application, companyName, addressLine1, addressLine2 } = data

//   const cw = parseFloat(application.contract_works_total) || 0
//   const vt = parseFloat(application.variations_total) || 0
//   const grossTotal = cw + vt
//   const retentionPerc = parseFloat(application.retention_percentage) || 0
//   const discountPerc = parseFloat(application.discount_percentage) || 0
//   const retentionAmount = grossTotal * (retentionPerc / 100)
//   const discountAmount = grossTotal * (discountPerc / 100)

//   const cumulativeNetApplication = grossTotal + retentionAmount + discountAmount
//   const netPaymentDue = parseFloat(application.amount_claimed) || 0

//   const ws_data = [
//     [companyName || "COMPANY NAME"],
//     [addressLine1 || ""],
//     [addressLine2 || ""],
//     [],
//     ["APPLICATION FOR PAYMENT"],
//     [],
//     [
//       "Application No:", application.application_number.toString(), 
//       "", 
//       "Date:", application.date, 
//       "", 
//       "Ref No:", application.ref_no || "—"
//     ],
//     [],
//     ["Breakdown of Application", "Amount"],
//     ["Contract Works", formatCurrency(cw)],
//     ["Variations", formatCurrency(vt)],
//     ["Cumulative Gross Total", formatCurrency(grossTotal)],
//     [`Less Retention (${retentionPerc}%)`, formatCurrency(retentionAmount)],
//     [`Less Discount (${discountPerc}%)`, formatCurrency(discountAmount)],
//     ["Cumulative Net Application", formatCurrency(cumulativeNetApplication)],
//     ["Cumulative Net Payment Received", "—"],
//     [],
//     ["Net Payment Due", formatCurrency(netPaymentDue)],
//     [],
//     ["If you do not agree with any items within our application, please forward full details within five days of the date of this Application."],
//     ["Please note that in compliance with the Housing Grants Construction and Regeneration Act 1996, it is a statutory requirement that you advise us within a period of 5 days from the due date of the Application of any amount proposed to be withheld from the gross value applied for, and the ground for withholding. If there are more than one ground, each ground and the amount attributable to it must be detailed."]
//   ]

//   const ws = XLSX.utils.aoa_to_sheet(ws_data)

//   // Adjust column widths to make it look nicer
//   ws['!cols'] = [
//     { wch: 45 }, // Description / Company Name
//     { wch: 20 }, // Amounts / App No
//     { wch: 5 },  // Gap
//     { wch: 10 }, // Date Label
//     { wch: 15 }, // Date Value
//     { wch: 5 },  // Gap
//     { wch: 10 }, // Ref No Label
//     { wch: 20 }, // Ref No Value
//   ]

//   const wb = XLSX.utils.book_new()
//   XLSX.utils.book_append_sheet(wb, ws, "Application")
//   XLSX.writeFile(wb, `Application-${application.application_number}.xlsx`)
// }

import ExcelJS from "exceljs"
import { ApplicationPdfData } from "./generate-application-pdf"

const BRAND_COLOR = "1F4E78"      // dark blue header
const ACCENT_COLOR = "DCE6F1"     // light blue band
const TOTAL_COLOR = "FFF2CC"      // pale gold for totals
const DUE_COLOR = "2E7D32"        // green for the final "due" figure

export async function generateApplicationExcel(data: ApplicationPdfData) {
  const { application, companyName, addressLine1, addressLine2 } = data

  const cw = parseFloat(application.contract_works_total) || 0
  const vt = parseFloat(application.variations_total) || 0
  const grossTotal = cw + vt
  const retentionPerc = parseFloat(application.retention_percentage) || 0
  const discountPerc = parseFloat(application.discount_percentage) || 0
  const retentionAmount = grossTotal * (retentionPerc / 100)
  const discountAmount = grossTotal * (discountPerc / 100)
  const cumulativeNetApplication = grossTotal + retentionAmount + discountAmount
  const netPaymentDue = parseFloat(application.amount_claimed) || 0

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet("Application", {
    views: [{ showGridLines: false }],
  })

  ws.columns = [
    { width: 42 }, // A - description
    { width: 22 }, // B - amount
    { width: 4 },  // C - gap
    { width: 14 }, // D
    { width: 16 }, // E
    { width: 4 },  // F - gap
    { width: 12 }, // G
    { width: 20 }, // H
  ]

  // ---- Header banner ----
  ws.mergeCells("A1:H1")
  const companyCell = ws.getCell("A1")
  companyCell.value = companyName || "COMPANY NAME"
  companyCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } }
  companyCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${BRAND_COLOR}` },
  }
  companyCell.alignment = { vertical: "middle", horizontal: "left" }
  ws.getRow(1).height = 32

  ws.mergeCells("A2:H2")
  ws.getCell("A2").value = addressLine1 || ""
  ws.mergeCells("A3:H3")
  ws.getCell("A3").value = addressLine2 || ""
    ;["A2", "A3"].forEach((ref) => {
      const cell = ws.getCell(ref)
      cell.font = { size: 10, color: { argb: "FFFFFFFF" } }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND_COLOR}` } }
    })

  ws.addRow([])

  // ---- Title ----
  ws.mergeCells("A5:H5")
  const titleCell = ws.getCell("A5")
  titleCell.value = "APPLICATION FOR PAYMENT"
  titleCell.font = { bold: true, size: 14, color: { argb: `FF${BRAND_COLOR}` } }
  titleCell.alignment = { horizontal: "center" }
  ws.getRow(5).height = 26

  ws.addRow([])

  // ---- Meta info row ----
  const metaRow = ws.addRow([
    "Application No:", application.application_number.toString(),
    "", "Date:", application.date,
    "", "Ref No:", application.ref_no || "—",
  ])
  metaRow.eachCell((cell, colNum) => {
    if ([1, 4, 7].includes(colNum)) cell.font = { bold: true }
  })

  ws.addRow([])

  // ---- Table header ----
  const tableHeaderRow = ws.addRow(["Breakdown of Application", "Amount"])
  tableHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND_COLOR}` } }
    cell.alignment = { horizontal: cell.col === "1" ? "left" : "right" }
    cell.border = thinBorder()
  })

  // ---- Data rows ----
  const dataRows: [string, number, "normal" | "total" | "due"][] = [
    ["Contract Works", cw, "normal"],
    ["Variations", vt, "normal"],
    ["Cumulative Gross Total", grossTotal, "total"],
    [`Less Retention (${retentionPerc}%)`, retentionAmount, "normal"],
    [`Less Discount (${discountPerc}%)`, discountAmount, "normal"],
    ["Cumulative Net Application", cumulativeNetApplication, "total"],
  ]

  dataRows.forEach(([label, value, kind], i) => {
    const row = ws.addRow([label, value])
    styleAmountCell(row.getCell(2))
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.border = thinBorder()
      if (kind === "total") {
        cell.font = { bold: true }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${TOTAL_COLOR}` } }
      } else if (i % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${ACCENT_COLOR}` } }
      }
    })
  })

  // Received row
  const receivedRow = ws.addRow(["Cumulative Net Payment Received", "—"])
  receivedRow.eachCell((cell) => (cell.border = thinBorder()))
  receivedRow.getCell(2).alignment = { horizontal: "right" }

  ws.addRow([])

  // ---- Net Payment Due (highlighted) ----
  const dueRow = ws.addRow(["Net Payment Due", netPaymentDue])
  styleAmountCell(dueRow.getCell(2))
  dueRow.eachCell((cell) => {
    cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${DUE_COLOR}` } }
    cell.border = thinBorder()
  })
  ws.getRow(dueRow.number).height = 22

  ws.addRow([])
  ws.addRow([])

  // ---- Footer notices ----
  const notice1 = ws.addRow([
    "If you do not agree with any items within our application, please forward full details within five days of the date of this Application.",
  ])
  const notice2 = ws.addRow([
    "Please note that in compliance with the Housing Grants Construction and Regeneration Act 1996, it is a statutory requirement that you advise us within a period of 5 days from the due date of the Application of any amount proposed to be withheld from the gross value applied for, and the ground for withholding. If there are more than one ground, each ground and the amount attributable to it must be detailed.",
  ])
    ;[notice1, notice2].forEach((row) => {
      ws.mergeCells(`A${row.number}:H${row.number}`)
      const cell = row.getCell(1)
      cell.font = { italic: true, size: 9, color: { argb: "FF555555" } }
      cell.alignment = { wrapText: true, vertical: "top" }
      ws.getRow(row.number).height = 30
    })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `Application-${application.application_number}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

function styleAmountCell(cell: ExcelJS.Cell) {
  cell.numFmt = '"£"#,##0.00;[Red]-"£"#,##0.00'
  cell.alignment = { horizontal: "right" }
}

function thinBorder(): Partial<ExcelJS.Borders> {
  return {
    top: { style: "thin", color: { argb: "FFD9D9D9" } },
    bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
    left: { style: "thin", color: { argb: "FFD9D9D9" } },
    right: { style: "thin", color: { argb: "FFD9D9D9" } },
  }
}