import ExcelJS from "exceljs"
import { ApplicationPdfData } from "./generate-application-pdf"

const BORDER_COLOR = "D9D9D9"
const TEXT_COLOR = "000000"
const MUTED_COLOR = "555555"
const BRAND_BLUE = "1F4E78"
const ACCENT_BG = "F2F4F8"
const DUE_BG = "E2EFDA" // light green

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

  const currentCumulative = grossTotal;
  const previousCumulative = 0;
  const grossMovement = currentCumulative - previousCumulative;

  const netPaymentDue = parseFloat(application.amount_claimed) || 0
  const orderValue = parseFloat(application.order_value || "0")

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet("Application", {
    views: [{ showGridLines: true }],
    properties: { defaultRowHeight: 25 },
  })

  ws.columns = [
    { width: 35 }, // A
    { width: 25 }, // B
    { width: 3 },  // C (Gap)
    { width: 35 }, // D
    { width: 15 }, // E
    { width: 25 }, // F
  ]

  const applyPanelStyle = (cell: ExcelJS.Cell, borderTop = true, borderBottom = true, borderLeft = true, borderRight = true) => {
    const bColor = { argb: `FF${BORDER_COLOR}` };
    cell.border = {
      top: borderTop ? { style: 'thin', color: bColor } : undefined,
      bottom: borderBottom ? { style: 'thin', color: bColor } : undefined,
      left: borderLeft ? { style: 'thin', color: bColor } : undefined,
      right: borderRight ? { style: 'thin', color: bColor } : undefined,
    }
  }

  // Rows 1-3: Header
  ws.mergeCells("A1:F1")
  ws.mergeCells("A2:F2")
  ws.mergeCells("A3:F3")

  const c1 = ws.getCell("A1"); c1.value = companyName || "Josue Test Company"; c1.font = { bold: true, size: 20, color: { argb: `FF${BRAND_BLUE}` } }; c1.alignment = { horizontal: 'center', vertical: 'middle' }
  const c2 = ws.getCell("A2"); c2.value = addressLine1 || "Address Line 1"; c2.font = { size: 10, color: { argb: `FF${MUTED_COLOR}` } }; c2.alignment = { horizontal: 'center', vertical: 'bottom' }
  const c3 = ws.getCell("A3"); c3.value = addressLine2 || "Tel: +44 0000 000000"; c3.font = { size: 10, color: { argb: `FF${MUTED_COLOR}` } }; c3.alignment = { horizontal: 'center', vertical: 'top' }

  ws.getRow(1).height = 40
  ws.getRow(2).height = 18
  ws.getRow(3).height = 18

  // Row 5: Blue Bar "APPLICATION FOR PAYMENT"
  ws.mergeCells("A5:F5")
  const r5 = ws.getCell("A5")
  r5.value = "APPLICATION FOR PAYMENT"
  r5.font = { bold: true, size: 12, color: { argb: `FFFFFFFF` } }
  r5.alignment = { horizontal: 'center', vertical: 'middle' }
  r5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND_BLUE}` } }
  applyPanelStyle(r5, true, true, true, true)
  ws.getRow(5).height = 30

  const infoStyle = (cell: ExcelJS.Cell, val: string) => {
    applyPanelStyle(cell)
    cell.value = val;
    cell.font = { size: 10, color: { argb: `FF${TEXT_COLOR}` } }
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  }

  // Row 6: Info Bar
  ws.mergeCells("A6:B6"); ws.mergeCells("C6:D6"); ws.mergeCells("E6:F6")
  infoStyle(ws.getCell("A6"), `Application Number: ${application.application_number} (Draft)`)
  infoStyle(ws.getCell("C6"), `Date: ${application.date}`)
  infoStyle(ws.getCell("E6"), `Ref No: ${application.ref_no || 'Enter Ref No'}`)

  const headerStyle = (cell: ExcelJS.Cell, val: string) => {
    applyPanelStyle(cell, true, false, true, true)
    cell.value = val;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${ACCENT_BG}` } }
    cell.font = { bold: true, size: 10, color: { argb: `FF${TEXT_COLOR}` } }
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  }

  // Row 7: Client headers
  ws.mergeCells("A7:B7"); ws.mergeCells("C7:D7"); ws.mergeCells("E7:F7")
  headerStyle(ws.getCell("A7"), "Client")
  headerStyle(ws.getCell("C7"), "Contract Site")
  headerStyle(ws.getCell("E7"), "Contacts")

  // Rows 8-9: Client empty blocks
  ws.mergeCells("A8:B9"); ws.mergeCells("C8:D9"); ws.mergeCells("E8:F9")
  applyPanelStyle(ws.getCell("A8"), false, true, true, true)
  applyPanelStyle(ws.getCell("C8"), false, true, true, true)
  applyPanelStyle(ws.getCell("E8"), false, true, true, true)
  ws.getRow(8).height = 60

  // Row 11: Section Titles
  ws.mergeCells("A11:B11")
  const mcTitle = ws.getCell("A11")
  applyPanelStyle(mcTitle)
  mcTitle.value = "Movement Calculations"
  mcTitle.font = { bold: true, size: 11, color: { argb: `FF${BRAND_BLUE}` } }
  mcTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getRow(11).height = 35

  ws.mergeCells("D11:F11")
  const daTitle = ws.getCell("D11")
  applyPanelStyle(daTitle)
  daTitle.value = "Details of Application"
  daTitle.font = { bold: true, size: 11, color: { argb: `FF${BRAND_BLUE}` } }
  daTitle.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

  // Rows 12-20 Base Panel Setup
  const setPanelRow = (r: number) => {
    applyPanelStyle(ws.getCell(`A${r}`), true, true, true, false)
    applyPanelStyle(ws.getCell(`B${r}`), true, true, false, true)

    applyPanelStyle(ws.getCell(`D${r}`), true, true, true, false)
    applyPanelStyle(ws.getCell(`E${r}`), true, true, false, false)
    applyPanelStyle(ws.getCell(`F${r}`), true, true, false, true)
  }

  for (let i = 13; i <= 20; i++) setPanelRow(i)

  const formatMoney = (cell: ExcelJS.Cell, val: number | { formula: string, result: number }, bold = false) => {
    cell.value = val;
    cell.numFmt = '"£"#,##0.00'
    cell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }
    if (bold) cell.font = { bold: true, color: { argb: `FF${TEXT_COLOR}` } }
  }

  const label = (cell: ExcelJS.Cell, txt: string, bold = false) => {
    cell.value = txt;
    cell.font = { bold, size: 9, color: { argb: `FF${TEXT_COLOR}` } }
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  }

  // Row 12
  applyPanelStyle(ws.getCell("A12"), true, true, true, false)
  applyPanelStyle(ws.getCell("B12"), true, true, false, true)
  label(ws.getCell("A12"), "Current Cumulative", false)
  formatMoney(ws.getCell("B12"), { formula: 'F15', result: currentCumulative }, true)

  ws.mergeCells("D12:F12")
  const d12 = ws.getCell("D12")
  applyPanelStyle(d12, true, true, true, true)
  d12.value = "Breakdown of Application"
  d12.font = { italic: true, size: 9, color: { argb: `FF${TEXT_COLOR}` } }
  d12.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }

  // Row 13
  label(ws.getCell("A13"), "Previous Cumulative", false)
  formatMoney(ws.getCell("B13"), previousCumulative, false)
  label(ws.getCell("D13"), "Contract Works", false)
  label(ws.getCell("E13"), "—", false); ws.getCell("E13").alignment = { horizontal: 'center', vertical: 'middle' }
  formatMoney(ws.getCell("F13"), cw, true)

  // Row 14
  label(ws.getCell("A14"), "Gross Movement in Period", true)
  formatMoney(ws.getCell("B14"), { formula: 'B12-B13', result: grossMovement }, true)
  label(ws.getCell("D14"), "Variations", false)
  label(ws.getCell("E14"), "—", false); ws.getCell("E14").alignment = { horizontal: 'center', vertical: 'middle' }
  formatMoney(ws.getCell("F14"), vt, false)

  // Row 15
  label(ws.getCell("A15"), "Projected Final Account", false)
  formatMoney(ws.getCell("B15"), 0, false)
  label(ws.getCell("D15"), "Cumulative Gross Total", true)
  label(ws.getCell("E15"), "—", false); ws.getCell("E15").alignment = { horizontal: 'center', vertical: 'middle' }
  formatMoney(ws.getCell("F15"), { formula: 'F13+F14', result: grossTotal }, true)

  // Row 16
  label(ws.getCell("A16"), "Order No", false)
  const b16 = ws.getCell("B16"); b16.value = application.order_no || "—"; b16.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }; b16.font = { color: { argb: `FF${MUTED_COLOR}` }, size: 9 }
  label(ws.getCell("D16"), "Less Retention (%)", false)
  const e16 = ws.getCell("E16"); e16.value = retentionPerc; e16.alignment = { horizontal: 'center', vertical: 'middle' }; e16.font = { color: { argb: `FF${TEXT_COLOR}` }, size: 9 }
  formatMoney(ws.getCell("F16"), { formula: 'F15*(E16/100)', result: retentionAmount }, false)

  // Row 17
  label(ws.getCell("A17"), "Order Value", false)
  formatMoney(ws.getCell("B17"), orderValue, true)
  label(ws.getCell("D17"), "Less Discount (%)", false)
  const e17 = ws.getCell("E17"); e17.value = discountPerc; e17.alignment = { horizontal: 'center', vertical: 'middle' }; e17.font = { color: { argb: `FF${TEXT_COLOR}` }, size: 9 }
  formatMoney(ws.getCell("F17"), { formula: 'F15*(E17/100)', result: discountAmount }, false)

  // Row 18
  label(ws.getCell("A18"), "Works Valued to Date", false)
  const b18 = ws.getCell("B18"); b18.value = "dd/mm/yyyy"; b18.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }; b18.font = { color: { argb: `FF${TEXT_COLOR}` }, size: 9 }
  label(ws.getCell("D18"), "Cumulative Net Application", false)
  label(ws.getCell("E18"), "—", false); ws.getCell("E18").alignment = { horizontal: 'center', vertical: 'middle' }
  formatMoney(ws.getCell("F18"), { formula: 'F15+F16+F17', result: cumulativeNetApplication }, true)

  // Row 19
  label(ws.getCell("A19"), "Payment Notice Date", false)
  const b19 = ws.getCell("B19"); b19.value = "dd/mm/yyyy"; b19.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }; b19.font = { color: { argb: `FF${TEXT_COLOR}` }, size: 9 }
  label(ws.getCell("D19"), "Cumulative Net Payment Received", false)
  label(ws.getCell("E19"), "—", false); ws.getCell("E19").alignment = { horizontal: 'center', vertical: 'middle' }
  formatMoney(ws.getCell("F19"), 0, false)

  // Row 20
  label(ws.getCell("A20"), "Final Date for Payment", false)
  const b20 = ws.getCell("B20"); b20.value = "dd/mm/yyyy"; b20.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 }; b20.font = { color: { argb: `FF${TEXT_COLOR}` }, size: 9 }
  label(ws.getCell("D20"), "Net Payment Due", true)
  label(ws.getCell("E20"), "")
  formatMoney(ws.getCell("F20"), { formula: 'F18-F19', result: netPaymentDue }, true)

  ws.getCell("D20").fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${DUE_BG}` } }
  ws.getCell("E20").fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${DUE_BG}` } }
  ws.getCell("F20").fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${DUE_BG}` } }
  ws.getRow(20).height = 30

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