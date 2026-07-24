import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { MonthlyApplicationApi } from "@/lib/api/monthly-application"
import { formatCurrency } from "@/lib/utils"

export type ApplicationPdfData = {
  companyName: string
  addressLine1: string
  addressLine2: string
  application: MonthlyApplicationApi
}

export function generateApplicationPdf(data: ApplicationPdfData): Blob {
  const doc = new jsPDF()
  const primaryColor: [number, number, number] = [42, 97, 216] // #2a61d8
  
  // Header section
  doc.setFontSize(22)
  doc.setTextColor(30, 30, 30)
  doc.setFont("helvetica", "bold")
  doc.text(data.companyName || "COMPANY NAME", 14, 22)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont("helvetica", "normal")
  doc.text(data.addressLine1 || "", 14, 28)
  doc.text(data.addressLine2 || "", 14, 33)

  // Title box
  doc.setFillColor(...primaryColor)
  doc.rect(14, 42, 182, 10, "F")
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.text("APPLICATION FOR PAYMENT", 105, 49, { align: "center" })

  // Top Info
  doc.setFontSize(11)
  doc.setTextColor(50, 50, 50)
  doc.setFont("helvetica", "normal")
  doc.text(`Application No:`, 14, 62)
  doc.setFont("helvetica", "bold")
  doc.text(`${data.application.application_number}`, 45, 62)

  doc.setFont("helvetica", "normal")
  doc.text(`Date:`, 85, 62)
  doc.setFont("helvetica", "bold")
  doc.text(`${data.application.date}`, 98, 62)

  doc.setFont("helvetica", "normal")
  doc.text(`Ref No:`, 145, 62)
  doc.setFont("helvetica", "bold")
  doc.text(`${data.application.ref_no || "—"}`, 160, 62)
  
  // Calculations
  const cw = parseFloat(data.application.contract_works_total) || 0
  const vt = parseFloat(data.application.variations_total) || 0
  const grossTotal = cw + vt
  const retentionPerc = parseFloat(data.application.retention_percentage) || 0
  const discountPerc = parseFloat(data.application.discount_percentage) || 0
  const retentionAmount = grossTotal * (retentionPerc / 100)
  const discountAmount = grossTotal * (discountPerc / 100)
  
  const cumulativeNetApplication = grossTotal + retentionAmount + discountAmount

  autoTable(doc, {
    startY: 75,
    head: [["Breakdown of Application", "Amount"]],
    body: [
      ["Contract Works", formatCurrency(cw)],
      ["Variations", formatCurrency(vt)],
      ["Cumulative Gross Total", formatCurrency(grossTotal)],
      [`Less Retention (${retentionPerc}%)`, formatCurrency(retentionAmount)],
      [`Less Discount (${discountPerc}%)`, formatCurrency(discountAmount)],
      ["Cumulative Net Application", formatCurrency(cumulativeNetApplication)],
      ["Cumulative Net Payment Received", "—"],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [50, 50, 50],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    didParseCell: (data) => {
      if (data.row.index === 2 || data.row.index === 5) {
        data.cell.styles.fontStyle = 'bold'
      }
    }
  })

  // @ts-ignore - lastAutoTable exists in jspdf-autotable plugin
  const finalY = doc.lastAutoTable.finalY

  // Net Payment Due highlight box
  doc.setFillColor(...primaryColor)
  doc.rect(14, finalY + 10, 182, 12, "F")
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.text("Net Payment Due", 20, finalY + 18)
  
  doc.text(formatCurrency(parseFloat(data.application.amount_claimed) || 0), 190, finalY + 18, { align: "right" })

  // Footer notes
  const footerY = finalY + 40
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont("helvetica", "normal")
  
  const notes1 = "If you do not agree with any items within our application, please forward full details within five days of the date of this Application."
  const notes2 = "Please note that in compliance with the Housing Grants Construction and Regeneration Act 1996, it is a statutory requirement that you advise us within a period of 5 days from the due date of the Application of any amount proposed to be withheld from the gross value applied for, and the ground for withholding. If there are more than one ground, each ground and the amount attributable to it must be detailed."
  
  const splitNotes1 = doc.splitTextToSize(notes1, 182)
  doc.text(splitNotes1, 14, footerY)
  
  const splitNotes2 = doc.splitTextToSize(notes2, 182)
  doc.text(splitNotes2, 14, footerY + splitNotes1.length * 4 + 8)

  return doc.output("blob")
}
